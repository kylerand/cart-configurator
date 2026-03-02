#!/usr/bin/env python3
"""
2D Configurator Asset Pipeline

Generates and processes layered transparent WebP images for the 2D
image-compositing configurator.

Three modes:
  1. prompts  - Print AI image generation prompts for each needed asset
  2. process  - Remove backgrounds from raw images and output named WebP layers
  3. generate - Create colored placeholder layers for immediate PoC demo

Usage:
  # Generate AI prompts to clipboard/stdout
  python generate_2d_assets.py prompts

  # Process raw AI-generated images into named layers
  python generate_2d_assets.py process --input ./raw_images/

  # Generate colored placeholder layers for immediate demo
  python generate_2d_assets.py generate
"""

import argparse
import json
import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Catalog data (mirrors apps/api/src/data/seed.ts)
# ---------------------------------------------------------------------------

VIEWS = ["front", "rear", "interior"]

OPTIONS = [
    # WHEELS
    {"id": "wheels-standard", "name": "Standard Wheels", "category": "WHEELS", "layer": "wheels"},
    {"id": "wheels-chrome",   "name": "Chrome Wheels",   "category": "WHEELS", "layer": "wheels"},
    {"id": "wheels-offroad",  "name": "Off-Road Wheels",  "category": "WHEELS", "layer": "wheels"},
    # ROOF
    {"id": "roof-standard",  "name": "Standard Roof",    "category": "ROOF",  "layer": "roof"},
    {"id": "roof-extended",  "name": "Extended Roof",    "category": "ROOF",  "layer": "roof"},
    {"id": "roof-solar",     "name": "Solar Panel Roof", "category": "ROOF",  "layer": "roof"},
    # SEATING
    {"id": "seat-standard",  "name": "Standard Bench Seats",     "category": "SEATING", "layer": "seats"},
    {"id": "seat-captain",   "name": "Captain Seats",            "category": "SEATING", "layer": "seats"},
    {"id": "seat-premium",   "name": "Premium Suspension Seats", "category": "SEATING", "layer": "seats"},
    # LIGHTING
    {"id": "light-basic",    "name": "Basic Lighting",     "category": "LIGHTING", "layer": "accessories"},
    {"id": "light-premium",  "name": "Premium LED Package","category": "LIGHTING", "layer": "accessories"},
    {"id": "light-bar",      "name": "Roof Light Bar",     "category": "LIGHTING", "layer": "accessories"},
    # STORAGE
    {"id": "storage-rear-basket", "name": "Rear Basket",        "category": "STORAGE", "layer": "storage"},
    {"id": "storage-under-seat",  "name": "Under-Seat Storage", "category": "STORAGE", "layer": "storage"},
    # ELECTRONICS
    {"id": "audio-basic",     "name": "Basic Audio",        "category": "ELECTRONICS", "layer": "audio"},
    {"id": "audio-premium",   "name": "Premium Audio",      "category": "ELECTRONICS", "layer": "audio"},
    {"id": "electronics-usb", "name": "USB Charging Ports", "category": "ELECTRONICS", "layer": "audio"},
    # SUSPENSION
    {"id": "suspension-lift-3", "name": "3\" Lift Kit", "category": "SUSPENSION", "layer": "body"},
    {"id": "suspension-lift-6", "name": "6\" Lift Kit", "category": "SUSPENSION", "layer": "body"},
    # FABRICATION
    {"id": "fab-custom-bumper", "name": "Custom Front Bumper", "category": "FABRICATION", "layer": "accessories"},
    {"id": "fab-bed-liner",     "name": "Spray-In Bed Liner",  "category": "FABRICATION", "layer": "accessories"},
]

BODY_COLORS = [
    {"id": "paint-white-gloss",  "name": "Gloss White",   "hex": "#FFFFFF"},
    {"id": "paint-black-matte",  "name": "Matte Black",   "hex": "#1a1a1a"},
    {"id": "paint-red-metallic", "name": "Metallic Red",  "hex": "#c41e3a"},
    {"id": "paint-blue-gloss",   "name": "Ocean Blue",    "hex": "#0077be"},
]

# Which views each layer appears in
LAYER_VIEWS = {
    "wheels":      ["front", "rear"],
    "roof":        ["front", "rear"],
    "seats":       ["interior"],
    "accessories": ["front", "rear"],
    "storage":     ["rear"],
    "audio":       ["interior"],
    "body":        ["front", "rear"],
}

# Resolve paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ASSETS_DIR = PROJECT_ROOT / "apps" / "web" / "public" / "assets" / "2d"
RAW_DIR = SCRIPT_DIR / "raw_images"

IMAGE_SIZE = (1200, 800)


# ---------------------------------------------------------------------------
# Mode 1: Generate AI prompts
# ---------------------------------------------------------------------------

BASE_PROMPT_STYLE = (
    "Product photography style, studio lighting, solid pure white background (#FFFFFF), "
    "no shadows on background, clean isolated subject, high resolution, photorealistic, "
    "professional product shot"
)

CAMERA_ANGLES = {
    "front": "front three-quarter view, slightly elevated camera angle, showing front and driver side",
    "rear":  "rear three-quarter view, slightly elevated camera angle, showing back and passenger side",
    "interior": "interior view from slightly above looking down at seats and dashboard, bird's eye interior",
}


def generate_prompts():
    """Print AI prompts for all needed images."""

    prompts = []

    # Background images (3)
    for view in VIEWS:
        prompts.append({
            "filename": f"background-{view}.webp",
            "purpose": f"Background for {view} view",
            "prompt": (
                f"Minimalist studio background for product photography, "
                f"soft gradient from light gray (#e8e8e8) center to darker edges (#b0b0b0), "
                f"subtle ground shadow area at bottom, {CAMERA_ANGLES[view]}, "
                f"no objects, just the empty studio backdrop, 1200x800 pixels"
            ),
        })

    # Base cart body per color per view (12 images = 4 colors × 3 views)
    for color in BODY_COLORS:
        for view in VIEWS:
            if view == "interior":
                prompts.append({
                    "filename": f"{color['id']}-cart-{view}-body.webp",
                    "purpose": f"{color['name']} cart interior body panels, {view} view",
                    "prompt": (
                        f"Golf cart interior dashboard and body panels painted {color['name']} ({color['hex']}), "
                        f"showing dashboard, steering wheel, floor area, and inner door panels. "
                        f"NO seats, NO roof, NO electronics visible. "
                        f"{CAMERA_ANGLES[view]}. {BASE_PROMPT_STYLE}"
                    ),
                })
            else:
                prompts.append({
                    "filename": f"{color['id']}-cart-{view}-body.webp",
                    "purpose": f"{color['name']} cart body, {view} view",
                    "prompt": (
                        f"Golf cart body/frame only, painted {color['name']} ({color['hex']}), "
                        f"4-seat golf cart chassis and body panels, NO wheels, NO roof, NO accessories. "
                        f"Just the bare painted body shell on a transparent/white background. "
                        f"{CAMERA_ANGLES[view]}. {BASE_PROMPT_STYLE}"
                    ),
                })

    # Component layers (option images)
    for opt in OPTIONS:
        views_for_layer = LAYER_VIEWS.get(opt["layer"], ["front"])
        for view in views_for_layer:
            prompts.append({
                "filename": f"{opt['id']}-cart-{view}-{opt['layer']}.webp",
                "purpose": f"{opt['name']} ({opt['category']}), {view} view",
                "prompt": _component_prompt(opt, view),
            })

    # Summary
    print(f"\n{'='*70}")
    print(f"  2D CONFIGURATOR — AI IMAGE GENERATION PROMPTS")
    print(f"  Total images needed: {len(prompts)}")
    print(f"{'='*70}\n")

    # Group by purpose
    backgrounds = [p for p in prompts if p["filename"].startswith("background")]
    bodies = [p for p in prompts if "body" in p["filename"] and "paint" in p["filename"]]
    components = [p for p in prompts if p not in backgrounds and p not in bodies]

    print(f"📷 BACKGROUNDS ({len(backgrounds)} images)")
    print(f"{'-'*50}")
    for p in backgrounds:
        _print_prompt(p)

    print(f"\n🎨 BODY COLORS ({len(bodies)} images)")
    print(f"{'-'*50}")
    for p in bodies:
        _print_prompt(p)

    print(f"\n🔧 COMPONENTS ({len(components)} images)")
    print(f"{'-'*50}")
    for p in components:
        _print_prompt(p)

    # Save as JSON for batch processing
    prompts_file = SCRIPT_DIR / "ai_prompts.json"
    with open(prompts_file, "w") as f:
        json.dump(prompts, f, indent=2)
    print(f"\n✅ All prompts saved to: {prompts_file}")
    print(f"   Use these with DALL-E, Midjourney, or Stable Diffusion")

    # Print quickstart guide
    print(f"\n{'='*70}")
    print("  QUICKSTART: Minimum viable set (9 images)")
    print(f"{'='*70}")
    print("""
For the fastest PoC, generate just these 9 images:

  1. background-front.webp    — Studio backdrop, front angle
  2. background-rear.webp     — Studio backdrop, rear angle
  3. background-interior.webp — Studio backdrop, interior angle

  4. paint-white-gloss-cart-front-body.webp  — White cart body, front
  5. paint-white-gloss-cart-rear-body.webp   — White cart body, rear
  6. paint-white-gloss-cart-interior-body.webp — White cart interior

  7. wheels-chrome-cart-front-wheels.webp    — Chrome wheels, front
  8. seat-captain-cart-interior-seats.webp   — Captain seats, interior
  9. roof-extended-cart-front-roof.webp      — Extended roof, front

Then run: python generate_2d_assets.py process --input ./raw_images/
""")


def _component_prompt(opt, view):
    """Generate a specific prompt for a component option."""
    prompts_map = {
        "wheels-standard":  "Standard steel golf cart wheels with basic hubcaps, set of 4",
        "wheels-chrome":    "Shiny chrome alloy golf cart wheels, premium polished finish, set of 4",
        "wheels-offroad":   "Aggressive off-road knobby tires on matte black wheels, lifted stance, set of 4",
        "roof-standard":    "Standard flat golf cart canopy roof, basic design",
        "roof-extended":    "Extended golf cart roof canopy with rear overhang for back seat shade",
        "roof-solar":       "Golf cart roof with integrated solar panels on top, modern tech look",
        "seat-standard":    "Standard vinyl bench seat for golf cart, basic black",
        "seat-captain":     "Individual captain bucket seats for golf cart, bolstered sides, premium look",
        "seat-premium":     "Premium suspension seats for golf cart with thick cushioning and armrests",
        "light-basic":      "Basic golf cart headlights and taillights, standard halogen",
        "light-premium":    "Premium LED light package for golf cart, bright white LEDs, DRL strip",
        "light-bar":        "LED light bar mounted on golf cart roof, off-road auxiliary lighting",
        "storage-rear-basket":  "Wire mesh rear cargo basket attached to back of golf cart",
        "storage-under-seat":   "Under-seat storage compartment for golf cart, open showing space",
        "audio-basic":      "Basic golf cart speakers mounted in dash area",
        "audio-premium":    "Premium marine-grade speaker system in golf cart with subwoofer",
        "electronics-usb":  "USB charging ports panel installed in golf cart dashboard",
        "suspension-lift-3": "Golf cart with 3-inch suspension lift kit, slightly raised body",
        "suspension-lift-6": "Golf cart with 6-inch suspension lift kit, noticeably raised body, aggressive stance",
        "fab-custom-bumper": "Custom fabricated front brush guard bumper on golf cart, tubular steel",
        "fab-bed-liner":     "Spray-in bed liner coating on golf cart rear cargo area, textured black",
    }

    desc = prompts_map.get(opt["id"], f"{opt['name']} for a golf cart")

    return (
        f"{desc}. "
        f"ONLY show this specific component/part, NO other parts visible. "
        f"Isolated on pure white background for compositing. "
        f"{CAMERA_ANGLES[view]}. {BASE_PROMPT_STYLE}"
    )


def _print_prompt(p):
    print(f"\n  📸 {p['filename']}")
    print(f"     Purpose: {p['purpose']}")
    print(f"     Prompt:  {p['prompt'][:120]}...")
    print()


# ---------------------------------------------------------------------------
# Mode 2: Process raw images (remove background, resize, convert to WebP)
# ---------------------------------------------------------------------------

def process_images(input_dir: Path):
    """Process raw AI-generated images: remove bg, resize, save as WebP."""
    try:
        from rembg import remove
        from PIL import Image
        import io
    except ImportError:
        print("❌ Missing dependencies. Run:")
        print("   source scripts/.venv/bin/activate")
        print("   pip install rembg Pillow onnxruntime")
        sys.exit(1)

    if not input_dir.exists():
        print(f"❌ Input directory not found: {input_dir}")
        print(f"   Create it and add your AI-generated images there.")
        print(f"   mkdir -p {input_dir}")
        sys.exit(1)

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    image_files = sorted([
        f for f in input_dir.iterdir()
        if f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff')
    ])

    if not image_files:
        print(f"❌ No images found in {input_dir}")
        sys.exit(1)

    print(f"\n{'='*50}")
    print(f"  Processing {len(image_files)} images")
    print(f"  Input:  {input_dir}")
    print(f"  Output: {ASSETS_DIR}")
    print(f"{'='*50}\n")

    for img_path in image_files:
        print(f"  Processing: {img_path.name}...")

        # Read image
        with open(img_path, "rb") as f:
            input_data = f.read()

        # Check if this is a background image (skip bg removal)
        is_background = "background" in img_path.stem.lower()

        if is_background:
            img = Image.open(io.BytesIO(input_data)).convert("RGBA")
        else:
            # Remove background
            output_data = remove(input_data)
            img = Image.open(io.BytesIO(output_data)).convert("RGBA")

        # Resize to standard dimensions
        img = img.resize(IMAGE_SIZE, Image.Resampling.LANCZOS)

        # Determine output filename
        # If the input filename already matches convention, keep it
        # Otherwise, save with same stem
        out_name = img_path.stem + ".webp"
        out_path = ASSETS_DIR / out_name

        img.save(out_path, "WEBP", quality=90, lossless=False)
        print(f"    ✅ Saved: {out_path.name} ({out_path.stat().st_size // 1024}KB)")

    print(f"\n✅ Done! {len(image_files)} images processed to {ASSETS_DIR}")


# ---------------------------------------------------------------------------
# Mode 3: Generate colored placeholder layers
# ---------------------------------------------------------------------------

def generate_placeholders():
    """Generate visually decent placeholder layers using PIL."""
    try:
        from PIL import Image, ImageDraw, ImageFont, ImageFilter
    except ImportError:
        print("❌ Pillow not installed. Run:")
        print("   source scripts/.venv/bin/activate && pip install Pillow")
        sys.exit(1)

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    W, H = IMAGE_SIZE
    generated = 0

    print(f"\n{'='*50}")
    print(f"  Generating placeholder 2D assets")
    print(f"  Output: {ASSETS_DIR}")
    print(f"{'='*50}\n")

    # 1. Background images
    for view in VIEWS:
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Gradient background
        for y in range(H):
            r = int(30 + (y / H) * 15)
            g = int(27 + (y / H) * 12)
            b = int(22 + (y / H) * 10)
            draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

        # Ground plane effect
        ground_y = int(H * 0.7)
        for y in range(ground_y, H):
            progress = (y - ground_y) / (H - ground_y)
            alpha = int(40 * progress)
            draw.line([(0, y), (W, y)], fill=(60, 55, 45, alpha))

        # Grid lines for ground
        for x in range(0, W, 60):
            draw.line([(x, ground_y), (x, H)], fill=(80, 72, 60, 30), width=1)
        for y in range(ground_y, H, 30):
            draw.line([(0, y), (W, y)], fill=(80, 72, 60, 20), width=1)

        out = ASSETS_DIR / f"background-{view}.webp"
        img.save(out, "WEBP", quality=90)
        generated += 1
        print(f"  ✅ {out.name}")

    # 2. Body color layers — cart silhouette in each color
    for color in BODY_COLORS:
        hex_color = color["hex"].lstrip("#")
        r, g, b = int(hex_color[:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)

        for view in ["front", "rear", "interior"]:
            img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)

            if view == "interior":
                _draw_interior_body(draw, W, H, (r, g, b))
            elif view == "front":
                _draw_cart_body_front(draw, W, H, (r, g, b))
            else:
                _draw_cart_body_rear(draw, W, H, (r, g, b))

            out = ASSETS_DIR / f"{color['id']}-cart-{view}-body.webp"
            img.save(out, "WEBP", quality=90)
            generated += 1
            print(f"  ✅ {out.name}")

    # 3. Component layers
    for opt in OPTIONS:
        views_for_layer = LAYER_VIEWS.get(opt["layer"], ["front"])
        for view in views_for_layer:
            img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)

            _draw_component(draw, W, H, opt, view)

            out = ASSETS_DIR / f"{opt['id']}-cart-{view}-{opt['layer']}.webp"
            img.save(out, "WEBP", quality=90)
            generated += 1
            print(f"  ✅ {out.name}")

    print(f"\n✅ Generated {generated} placeholder images in {ASSETS_DIR}")
    print("   These are colored shapes — replace with AI-generated images for production.")


def _draw_cart_body_front(draw, W, H, color):
    """Draw a front 3/4 view cart body silhouette."""
    r, g, b = color
    cx, cy = W // 2, int(H * 0.45)

    # Main body shape — simplified cart from front-quarter
    body_points = [
        (cx - 200, cy + 100),  # bottom left
        (cx - 220, cy - 20),   # left side
        (cx - 180, cy - 80),   # left roof line
        (cx - 60, cy - 100),   # top left
        (cx + 80, cy - 100),   # top right
        (cx + 200, cy - 70),   # right roof line
        (cx + 240, cy - 10),   # right side
        (cx + 220, cy + 100),  # bottom right
    ]
    draw.polygon(body_points, fill=(r, g, b, 220))

    # Body highlight
    highlight_points = [
        (cx - 190, cy - 10),
        (cx - 160, cy - 65),
        (cx + 60, cy - 85),
        (cx + 180, cy - 55),
        (cx + 210, cy + 10),
        (cx + 100, cy + 30),
        (cx - 80, cy + 30),
    ]
    draw.polygon(highlight_points, fill=(min(r + 30, 255), min(g + 30, 255), min(b + 30, 255), 180))

    # Windshield
    windshield = [
        (cx - 140, cy - 60),
        (cx - 40, cy - 85),
        (cx + 70, cy - 85),
        (cx + 160, cy - 55),
        (cx + 140, cy - 20),
        (cx - 120, cy - 20),
    ]
    draw.polygon(windshield, fill=(180, 200, 220, 120))

    # Headlights
    draw.ellipse([cx - 180, cy + 10, cx - 140, cy + 45], fill=(255, 255, 200, 200))
    draw.ellipse([cx + 140, cy + 20, cx + 180, cy + 55], fill=(255, 255, 200, 200))

    # Fender arches
    draw.arc([cx - 230, cy + 40, cx - 120, cy + 150], 180, 0, fill=(max(r - 40, 0), max(g - 40, 0), max(b - 40, 0), 255), width=4)
    draw.arc([cx + 110, cy + 50, cx + 250, cy + 160], 180, 0, fill=(max(r - 40, 0), max(g - 40, 0), max(b - 40, 0), 255), width=4)


def _draw_cart_body_rear(draw, W, H, color):
    """Draw a rear 3/4 view cart body silhouette."""
    r, g, b = color
    cx, cy = W // 2, int(H * 0.45)

    body_points = [
        (cx - 220, cy + 100),
        (cx - 240, cy - 10),
        (cx - 200, cy - 70),
        (cx - 80, cy - 100),
        (cx + 60, cy - 100),
        (cx + 180, cy - 80),
        (cx + 220, cy - 20),
        (cx + 200, cy + 100),
    ]
    draw.polygon(body_points, fill=(r, g, b, 220))

    # Rear panel
    rear_panel = [
        (cx - 200, cy - 50),
        (cx - 60, cy - 80),
        (cx - 40, cy + 80),
        (cx - 180, cy + 80),
    ]
    draw.polygon(rear_panel, fill=(max(r - 20, 0), max(g - 20, 0), max(b - 20, 0), 200))

    # Tail lights
    draw.rectangle([cx - 195, cy + 20, cx - 170, cy + 50], fill=(255, 50, 50, 220))
    draw.rectangle([cx + 170, cy + 30, cx + 195, cy + 60], fill=(255, 50, 50, 220))

    # Rear fender arches
    draw.arc([cx - 250, cy + 40, cx - 130, cy + 150], 180, 0, fill=(max(r - 40, 0), max(g - 40, 0), max(b - 40, 0), 255), width=4)
    draw.arc([cx + 100, cy + 50, cx + 240, cy + 160], 180, 0, fill=(max(r - 40, 0), max(g - 40, 0), max(b - 40, 0), 255), width=4)


def _draw_interior_body(draw, W, H, color):
    """Draw interior view body panels."""
    r, g, b = color
    cx, cy = W // 2, int(H * 0.5)

    # Dashboard panel
    draw.rectangle([cx - 300, cy - 100, cx + 300, cy + 30], fill=(r, g, b, 200))

    # Floor
    draw.polygon(
        [(cx - 350, cy + 50), (cx + 350, cy + 50), (cx + 300, H - 50), (cx - 300, H - 50)],
        fill=(40, 38, 35, 200)
    )

    # Steering column
    draw.ellipse([cx - 80, cy - 80, cx + 80, cy + 60], fill=(50, 48, 45, 220))
    draw.ellipse([cx - 60, cy - 60, cx + 60, cy + 40], fill=(60, 58, 55, 220))

    # Door panels
    draw.polygon(
        [(cx - 350, cy - 80), (cx - 300, cy - 100), (cx - 300, H - 80), (cx - 350, H - 50)],
        fill=(r, g, b, 180)
    )
    draw.polygon(
        [(cx + 350, cy - 80), (cx + 300, cy - 100), (cx + 300, H - 80), (cx + 350, H - 50)],
        fill=(r, g, b, 180)
    )


def _draw_component(draw, W, H, opt, view):
    """Draw a component placeholder based on option category."""
    cx, cy = W // 2, int(H * 0.45)
    category = opt["category"]
    opt_id = opt["id"]

    if category == "WHEELS":
        _draw_wheels(draw, cx, cy, opt_id, view)
    elif category == "ROOF":
        _draw_roof(draw, cx, cy, opt_id, view)
    elif category == "SEATING":
        _draw_seats(draw, cx, cy, opt_id)
    elif category == "LIGHTING":
        _draw_lighting(draw, cx, cy, opt_id, view)
    elif category == "STORAGE":
        _draw_storage(draw, cx, cy, opt_id)
    elif category == "ELECTRONICS":
        _draw_electronics(draw, cx, cy, opt_id)
    elif category == "SUSPENSION":
        _draw_suspension(draw, cx, cy, opt_id, view)
    elif category == "FABRICATION":
        _draw_fabrication(draw, cx, cy, opt_id, view)


def _draw_wheels(draw, cx, cy, opt_id, view):
    """Draw wheel variants."""
    if opt_id == "wheels-chrome":
        fill = (200, 200, 210, 240)
        spoke = (170, 170, 180, 200)
    elif opt_id == "wheels-offroad":
        fill = (60, 60, 60, 240)
        spoke = (80, 80, 80, 200)
    else:
        fill = (100, 100, 100, 240)
        spoke = (120, 120, 120, 200)

    # Front wheel
    if view == "front":
        wx1, wy1 = cx - 175, cy + 60
        wx2, wy2 = cx + 180, cy + 70
    else:
        wx1, wy1 = cx - 190, cy + 60
        wx2, wy2 = cx + 170, cy + 70

    for wx, wy in [(wx1, wy1), (wx2, wy2)]:
        # Tire
        draw.ellipse([wx - 50, wy - 45, wx + 50, wy + 45], fill=(30, 30, 30, 240))
        # Rim
        draw.ellipse([wx - 32, wy - 28, wx + 32, wy + 28], fill=fill)
        # Hub
        draw.ellipse([wx - 10, wy - 8, wx + 10, wy + 8], fill=spoke)

        if opt_id == "wheels-offroad":
            # Knobby tire texture lines
            for i in range(-4, 5):
                draw.arc([wx - 48 + i * 2, wy - 43, wx + 48 + i * 2, wy + 43],
                         i * 30, i * 30 + 20, fill=(50, 50, 50, 200), width=2)


def _draw_roof(draw, cx, cy, opt_id, view):
    """Draw roof variants."""
    if opt_id == "roof-standard":
        color = (50, 48, 45, 200)
    elif opt_id == "roof-extended":
        color = (50, 48, 45, 200)
    elif opt_id == "roof-solar":
        color = (40, 50, 70, 220)
    else:
        color = (50, 48, 45, 200)

    # Roof canopy
    if view == "front":
        points = [
            (cx - 180, cy - 100),
            (cx + 80, cy - 100),
            (cx + 160, cy - 75),
            (cx - 160, cy - 75),
        ]
        if opt_id == "roof-extended":
            points[2] = (cx + 220, cy - 75)
            points[1] = (cx + 140, cy - 100)
    else:
        points = [
            (cx - 80, cy - 100),
            (cx + 180, cy - 100),
            (cx + 160, cy - 75),
            (cx - 160, cy - 75),
        ]
        if opt_id == "roof-extended":
            points[0] = (cx - 140, cy - 100)
            points[3] = (cx - 220, cy - 75)

    draw.polygon(points, fill=color)

    # Support posts
    draw.line([points[0], (points[3][0], cy - 20)], fill=(80, 75, 70, 180), width=4)
    draw.line([points[1], (points[2][0], cy - 20)], fill=(80, 75, 70, 180), width=4)

    if opt_id == "roof-solar":
        # Solar panel grid
        px1, py1 = points[0]
        px2, py2 = points[1]
        for i in range(4):
            x = px1 + (px2 - px1) * i // 4
            draw.line([(x, py1 + 3), (x, py2 + 3)], fill=(60, 80, 120, 160), width=1)
        for i in range(3):
            y = py1 + (py2 - py1 + 25) * i // 3
            draw.line([(px1, y), (px2, y)], fill=(60, 80, 120, 160), width=1)


def _draw_seats(draw, cx, cy, opt_id):
    """Draw seat variants for interior view."""
    seat_color = (60, 58, 55, 230)

    if opt_id == "seat-standard":
        # Bench seat
        draw.rounded_rectangle([cx - 200, cy + 50, cx + 200, cy + 180], radius=10, fill=seat_color)
        # Back rest
        draw.rounded_rectangle([cx - 200, cy - 40, cx + 200, cy + 60], radius=10, fill=(70, 68, 65, 230))
    elif opt_id == "seat-captain":
        # Two individual seats
        for sx in [cx - 120, cx + 40]:
            draw.rounded_rectangle([sx, cy + 50, sx + 80, cy + 170], radius=12, fill=seat_color)
            draw.rounded_rectangle([sx, cy - 30, sx + 80, cy + 60], radius=12, fill=(70, 68, 65, 230))
            # Bolster
            draw.rounded_rectangle([sx - 5, cy - 20, sx + 10, cy + 50], radius=6, fill=(80, 78, 75, 200))
            draw.rounded_rectangle([sx + 70, cy - 20, sx + 85, cy + 50], radius=6, fill=(80, 78, 75, 200))
    elif opt_id == "seat-premium":
        # Premium seats with thicker cushions
        for sx in [cx - 130, cx + 30]:
            draw.rounded_rectangle([sx, cy + 40, sx + 100, cy + 180], radius=15, fill=seat_color)
            draw.rounded_rectangle([sx, cy - 50, sx + 100, cy + 50], radius=15, fill=(75, 73, 70, 240))
            # Headrest
            draw.rounded_rectangle([sx + 20, cy - 80, sx + 80, cy - 40], radius=10, fill=(80, 78, 75, 220))
            # Armrests
            draw.rounded_rectangle([sx - 10, cy + 10, sx + 5, cy + 100], radius=4, fill=(65, 63, 60, 200))
            draw.rounded_rectangle([sx + 95, cy + 10, sx + 110, cy + 100], radius=4, fill=(65, 63, 60, 200))


def _draw_lighting(draw, cx, cy, opt_id, view):
    """Draw lighting variants."""
    if opt_id == "light-basic":
        glow = (255, 255, 200, 140)
        draw.ellipse([cx - 180, cy + 10, cx - 140, cy + 45], fill=glow)
        if view == "front":
            draw.ellipse([cx + 140, cy + 20, cx + 180, cy + 55], fill=glow)
    elif opt_id == "light-premium":
        glow = (220, 240, 255, 180)
        draw.ellipse([cx - 185, cy + 5, cx - 135, cy + 50], fill=glow)
        # DRL strip
        draw.line([(cx - 180, cy + 8), (cx - 100, cy - 5)], fill=(200, 230, 255, 160), width=3)
        if view == "front":
            draw.ellipse([cx + 135, cy + 15, cx + 185, cy + 60], fill=glow)
            draw.line([(cx + 100, cy + 5), (cx + 180, cy + 18)], fill=(200, 230, 255, 160), width=3)
    elif opt_id == "light-bar":
        # Roof light bar
        bar_y = cy - 108
        draw.rounded_rectangle([cx - 120, bar_y, cx + 120, bar_y + 15], radius=4, fill=(40, 40, 40, 230))
        # LED elements
        for x in range(cx - 110, cx + 110, 15):
            draw.rectangle([x, bar_y + 2, x + 8, bar_y + 13], fill=(255, 255, 220, 200))


def _draw_storage(draw, cx, cy, opt_id):
    """Draw storage for rear view."""
    if opt_id == "storage-rear-basket":
        bx, by = cx - 100, cy + 60
        # Wire basket
        draw.rectangle([bx, by, bx + 200, by + 80], outline=(120, 120, 120, 200), width=2)
        for x in range(bx, bx + 200, 20):
            draw.line([(x, by), (x, by + 80)], fill=(100, 100, 100, 150), width=1)
        for y in range(by, by + 80, 20):
            draw.line([(bx, y), (bx + 200, y)], fill=(100, 100, 100, 150), width=1)
    elif opt_id == "storage-under-seat":
        draw.rounded_rectangle([cx - 150, cy + 120, cx + 150, cy + 180],
                              radius=6, fill=(50, 48, 45, 180))
        draw.text((cx - 40, cy + 140), "STORAGE", fill=(100, 95, 88, 180))


def _draw_electronics(draw, cx, cy, opt_id):
    """Draw electronics for interior view."""
    if opt_id == "audio-basic":
        # Small speaker circles
        draw.ellipse([cx - 250, cy - 20, cx - 220, cy + 10], fill=(45, 43, 40, 200))
        draw.ellipse([cx + 220, cy - 20, cx + 250, cy + 10], fill=(45, 43, 40, 200))
    elif opt_id == "audio-premium":
        # Larger speakers + sub
        draw.ellipse([cx - 260, cy - 30, cx - 215, cy + 15], fill=(40, 38, 35, 220))
        draw.ellipse([cx + 215, cy - 30, cx + 260, cy + 15], fill=(40, 38, 35, 220))
        # Subwoofer under seat area
        draw.ellipse([cx - 40, cy + 150, cx + 40, cy + 220], fill=(35, 33, 30, 200))
        draw.ellipse([cx - 25, cy + 160, cx + 25, cy + 210], fill=(50, 48, 45, 200))
    elif opt_id == "electronics-usb":
        # USB port panel
        draw.rounded_rectangle([cx + 50, cy - 40, cx + 100, cy - 10], radius=4, fill=(45, 43, 40, 220))
        draw.rectangle([cx + 60, cy - 35, cx + 75, cy - 25], fill=(30, 30, 30, 200))
        draw.rectangle([cx + 80, cy - 35, cx + 95, cy - 25], fill=(30, 30, 30, 200))


def _draw_suspension(draw, cx, cy, opt_id, view):
    """Draw suspension/lift kit effect."""
    # Show lifted stance via spring/shock elements visible below body
    lift = 15 if opt_id == "suspension-lift-3" else 30

    if view == "front":
        positions = [(cx - 175, cy + 60), (cx + 180, cy + 70)]
    else:
        positions = [(cx - 190, cy + 60), (cx + 170, cy + 70)]

    for wx, wy in positions:
        # Shock absorber
        draw.rectangle([wx - 5, wy - 30 - lift, wx + 5, wy - 10], fill=(180, 170, 50, 200))
        # Spring coil lines
        for i in range(4):
            y = wy - 28 - lift + i * 6
            draw.arc([wx - 12, y, wx + 12, y + 8], 0, 180, fill=(150, 150, 150, 180), width=2)


def _draw_fabrication(draw, cx, cy, opt_id, view):
    """Draw fabrication items."""
    if opt_id == "fab-custom-bumper" and view == "front":
        # Tubular brush guard
        by = cy + 80
        draw.rounded_rectangle([cx - 200, by, cx + 200, by + 20], radius=8, fill=(60, 60, 60, 220))
        draw.rounded_rectangle([cx - 180, by + 5, cx + 180, by + 25], radius=6, fill=(70, 70, 70, 200))
        # Vertical bars
        draw.rectangle([cx - 100, by - 30, cx - 90, by + 5], fill=(60, 60, 60, 220))
        draw.rectangle([cx + 90, by - 30, cx + 100, by + 5], fill=(60, 60, 60, 220))
    elif opt_id == "fab-bed-liner" and view == "rear":
        # Textured bed area
        bx1, by1 = cx - 120, cy + 40
        bx2, by2 = cx + 120, cy + 100
        draw.rectangle([bx1, by1, bx2, by2], fill=(35, 35, 35, 200))
        # Texture dots
        import random
        random.seed(42)
        for _ in range(100):
            x = random.randint(bx1, bx2)
            y = random.randint(by1, by2)
            draw.point((x, y), fill=(45, 45, 45, 200))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="2D Configurator Asset Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s prompts                          Print AI generation prompts
  %(prog)s process --input ./raw_images/    Process raw images to WebP
  %(prog)s generate                         Create colored placeholder layers
        """
    )
    parser.add_argument("mode", choices=["prompts", "process", "generate"],
                        help="Pipeline mode")
    parser.add_argument("--input", type=Path, default=RAW_DIR,
                        help="Input directory for raw images (process mode)")

    args = parser.parse_args()

    if args.mode == "prompts":
        generate_prompts()
    elif args.mode == "process":
        process_images(args.input)
    elif args.mode == "generate":
        generate_placeholders()


if __name__ == "__main__":
    main()
