# Configurator Data Collection - Example Output

## Purpose

This document shows what completed data looks like after collection. Use this as a reference when filling out the template.

---

## Example 1: Complete Option Entry

### Chrome Wheels - Fully Documented

```yaml
# ==========================================
# OPTION: Chrome Alloy Wheels (14-inch)
# ==========================================

option_id: wheels-chrome-14inch
name: "14\" Chrome Alloy Wheels"
category: WHEELS
description: |
  Premium chrome-plated aluminum wheels with mirror finish. 
  14-inch diameter, 7-inch width. Includes matching center 
  caps and stainless steel lug nuts. Perfect for show carts 
  and customers wanting maximum shine.

# PRICING
parts_cost: 800.00          # USD, set of 4 wheels
labor_hours: 1.5            # Mount, balance, install
labor_rate: 85.00           # Per hour (or use shop default)
total_cost: 927.50          # Calculated: 800 + (1.5 × 85)

# SPECIFICATIONS
weight_added_lbs: 45        # vs stock wheels
dimensions: "14\" × 7\""
bolt_pattern: "4/4\""
offset: "+10mm"
material: "Chrome-plated aluminum"

# TIRE INFO (included with wheel package)
tire_size: "205/50-14"
tire_type: "Low-profile street"
load_rating: "B (1,100 lbs)"
speed_rating: "E (25 mph max)"

# COMPATIBILITY
requires: []                # No prerequisites
excludes:
  - lift-kit-4inch          # Wheels won't fit with 4" lift
  - lift-kit-6inch          # Wheels won't fit with 6" lift
compatible_platforms:       # Works on all platforms
  - street-48v
  - street-72v
  - offroad-4x4

# INVENTORY & LEAD TIME
stock_status: "special_order"
lead_time_days: 7-10
supplier: "American Racing"
supplier_sku: "AR-172-C14"

# 3D ASSET
asset_available: true
asset_filename: "wheels_chrome_14in_v2.glb"
asset_notes: "Updated model includes realistic chrome reflection"

# ADDITIONAL DETAILS
warranty_years: 1
maintenance_notes: |
  Chrome requires periodic cleaning to prevent oxidation.
  Recommend ceramic coating ($150) for long-term protection.
popular_option: true
popularity_rank: 3          # 3rd most popular wheel option

# INTERNAL NOTES
engineering_notes: |
  Confirmed clearance with standard suspension. 
  NOT compatible with lift kits due to fender interference.
sales_notes: |
  Popular with show cart customers. Often paired with 
  paint-gloss-black body for contrast.
```

---

## Example 2: Solar Roof Option

```yaml
# ==========================================
# OPTION: Extended Solar Roof
# ==========================================

option_id: roof-extended-solar
name: "Extended Solar Roof with Charging"
category: ROOF
description: |
  Extended 72\" roof with integrated 200W solar panel. 
  Provides shade plus battery charging while parked or 
  driving. Includes MPPT charge controller and monitoring 
  display. Great for eco-conscious customers and extended 
  range applications.

# PRICING
parts_cost: 1850.00         # Roof frame + solar panel + controller
labor_hours: 4.0            # Installation + wiring + testing
labor_rate: 95.00           # Higher rate for electrical work
total_cost: 2230.00         # 1850 + (4 × 95)

# SPECIFICATIONS
weight_added_lbs: 65
dimensions: "72\" L × 56\" W × 3\" H"
mounting_points: "Roof posts + frame reinforcement"

# SOLAR SPECIFICATIONS
solar_wattage: 200          # Watts
solar_voltage: 48           # Volts (matches 48V platform)
charging_rate: "4-5 amps in full sun"
controller_type: "MPPT (Maximum Power Point Tracking)"
monitoring: "Digital display shows watts/voltage"

# RANGE EXTENSION
range_added_sunny: "8-12 miles"
range_added_cloudy: "2-4 miles"
range_added_parked: "15-20 miles per day (full sun)"

# COMPATIBILITY
requires:
  - platform-48v            # Only works with 48V system
excludes:
  - roof-standard           # Can't have two roofs
  - roof-extended           # Can't have two roofs
compatible_platforms:
  - street-48v              # Yes
  # NOT compatible with 72V or golf-standard

# INVENTORY & LEAD TIME
stock_status: "special_order"
lead_time_days: 14-21       # Solar panels take longer
supplier: "SunForce Solar + Custom Fabrication"
supplier_sku: "SF-200-48V + ROOF-EXT-001"

# 3D ASSET
asset_available: true
asset_filename: "roof_extended_solar_v3.glb"
asset_notes: "Model shows solar panel texture and mounting brackets"

# ADDITIONAL DETAILS
warranty_years: 2           # Roof frame
warranty_solar_years: 10    # Solar panel (manufacturer)
maintenance_notes: |
  Clean solar panel monthly with water and soft cloth.
  Avoid abrasive cleaners that can scratch anti-reflective coating.
  Check controller display monthly for proper operation.

popular_option: true
popularity_rank: 1          # Most popular roof option

# CERTIFICATIONS
certifications:
  - "UL Listed (solar panel)"
  - "IP65 Rated (weatherproof)"

# PERFORMANCE IMPACT
top_speed_change_mph: -1    # Slight drag from panel
range_change_sunny_pct: +25 # 25% more range in sun
range_change_cloudy_pct: +5 # 5% more range cloudy

# INTERNAL NOTES
engineering_notes: |
  Requires upgraded wiring harness (included in price).
  Solar charge controller integrated into dash display.
  Panel angle optimized for 35° latitude (adjustable).
  
sales_notes: |
  #1 selling point: "Pays for itself in 3-4 years"
  Great for customers who park outside
  Popular with golf courses and resorts
  Mention environmental benefits prominently
  
installation_notes: |
  Must wire through existing conduit.
  Test voltage at controller before final mount.
  Calibrate display to battery bank size.
```

---

## Example 3: Simple Accessory

```yaml
# ==========================================
# OPTION: Rear Storage Basket
# ==========================================

option_id: storage-rear-basket
name: "Rear Storage Basket"
category: STORAGE
description: |
  Heavy-duty steel basket mounts to rear of cart. 
  18\" × 24\" × 10\" interior space. Powder-coated finish.
  Perfect for tools, coolers, or cargo.

# PRICING
parts_cost: 195.00
labor_hours: 0.75           # Quick bolt-on installation
labor_rate: 75.00           # Standard assembly rate
total_cost: 251.25

# SPECIFICATIONS
weight_added_lbs: 18
dimensions: "24\" L × 20\" W × 12\" H (exterior)"
interior_dimensions: "18\" L × 24\" W × 10\" H"
capacity_cubic_inches: 4320
weight_capacity_lbs: 75
material: "1\" steel tube, powder-coated"

# COMPATIBILITY
requires: []                # No prerequisites
excludes: []                # Doesn't conflict with anything
compatible_platforms: "all" # Works on all cart types

# INVENTORY & LEAD TIME
stock_status: "in_stock"    # Commonly stocked item
lead_time_days: 0           # Available immediately
supplier: "In-house fabrication"

# 3D ASSET
asset_available: true
asset_filename: "storage_basket_rear_standard.glb"

# ADDITIONAL DETAILS
warranty_years: 1
finish_options:
  - "Powder coat (matches frame color)"
popular_option: true
popularity_rank: 2          # 2nd most popular storage option

# INTERNAL NOTES
sales_notes: |
  Easy upsell. Low cost, high perceived value.
  Mention weight capacity (75 lbs = 2 cases of beer 🍺)
```

---

## Example 4: Material Definition

```yaml
# ==========================================
# MATERIAL: Gloss Red Paint (Body)
# ==========================================

material_id: paint-gloss-red
name: "Gloss Red"
zone: BODY                  # Applied to body panels
type: PAINT
color_hex: "#DC143C"        # Crimson red
finish: GLOSS

# PRICING
base_price: 500.00          # For BODY zone
price_multiplier: 1.0       # Standard paint (no upcharge)

# SPECIFICATIONS
paint_type: "Automotive grade urethane"
coats: "Primer + 2 base + 2 clear"
finish_quality: "Show quality"
gloss_level: "High gloss (90+ gloss units)"

# LEAD TIME
stock_status: "in_stock"
lead_time_days: 0           # Stock color
cure_time_days: 2           # After application

# DURABILITY
uv_resistance: "Excellent"
scratch_resistance: "Good"
chemical_resistance: "Excellent"
warranty_years: 3

# MAINTENANCE
maintenance_notes: |
  Wash with pH-neutral soap
  Wax every 3 months
  Avoid automatic car washes (use touchless)

# POPULARITY
popular_option: true
popularity_rank: 2          # 2nd most popular body color

# 3D RENDERING
pbr_preset: "paint-gloss"   # Uses PBR preset for realistic rendering
color_accurate: true        # Hex code matches physical paint

# INTERNAL NOTES
notes: |
  Classic red, very popular
  Pairs well with chrome wheels and black roof
  No special prep required
```

---

## Example 5: Business Rule Definition

```yaml
# ==========================================
# RULE: Lift Kit requires Off-Road Tires
# ==========================================

rule_id: lift-requires-offroad-tires
rule_type: REQUIRES
description: "Lift kits require off-road or all-terrain tires"

# CONDITION
if_option_selected:
  - lift-kit-2inch
  - lift-kit-4inch
  - lift-kit-6inch

# REQUIREMENT
then_must_select_one_of:
  - wheels-offroad-standard
  - wheels-offroad-mudder
  - wheels-allterrain-14inch

# EXPLANATION
customer_message: |
  Lifted carts require off-road or all-terrain tires.
  Street tires are not recommended due to clearance 
  and stability concerns.

technical_reason: |
  Street tires are too narrow and don't provide 
  adequate clearance in wheel wells. Safety issue.

# ENFORCEMENT
enforcement: HARD          # Blocks configuration (vs SOFT warning)
priority: HIGH

# ALTERNATIVES
suggested_alternatives: |
  If customer wants street tires, recommend standard 
  suspension without lift kit.
```

---

## Example 6: Excluded Combination

```yaml
# ==========================================
# RULE: Solar Roof excludes Standard Roof
# ==========================================

rule_id: roof-mutual-exclusion
rule_type: EXCLUDES
description: "Can only have one roof type"

# OPTIONS THAT CONFLICT
option_group_1:
  - roof-standard
  - roof-extended
  - roof-extended-solar

# RULE
rule: "Only one roof option can be selected"

customer_message: |
  You can only select one roof type. Please choose:
  - Standard Roof (economy)
  - Extended Roof (more shade)
  - Extended Solar Roof (shade + charging)

technical_reason: |
  Physical constraint - cart can only have one roof.

enforcement: HARD
priority: HIGH

# UI BEHAVIOR
ui_behavior: "radio_group"  # Display as radio buttons (single choice)
```

---

## Example 7: Platform Definition

```yaml
# ==========================================
# PLATFORM: Street Legal 48V
# ==========================================

platform_id: street-48v
name: "Street Legal 48V Golf Cart"
description: |
  DOT-approved electric golf cart for low-speed vehicle (LSV) 
  use. 48V system, 25 mph top speed, 35-mile range. Includes 
  all required safety equipment for street use.

# BASE PRICING
base_price: 8500.00
includes: |
  - 48V electrical system (8× 6V batteries)
  - Standard 2-seat bench
  - Basic headlights/taillights
  - Turn signals
  - Horn
  - Mirrors
  - Windshield
  - DOT-compliant tires
  - VIN plate

# SPECIFICATIONS
voltage: 48
battery_type: "6V Lead-Acid (8 batteries)"
battery_capacity_ah: 225
motor_hp: 5.0
top_speed_mph: 25
range_miles: 35
wheelbase_inches: 78
track_width_inches: 47
weight_lbs: 950
weight_capacity_lbs: 800
passenger_capacity: 2        # Stock, can be upgraded

# CERTIFICATIONS
certifications:
  - "DOT LSV Approved"
  - "NHTSA Compliant"
street_legal: true
states_legal: "all"          # Legal in all 50 states (for LSV roads)

# BUILD INFO
typical_build_time_hours: 24
complexity_tier: 1           # Simple build

# WARRANTY
warranty_frame_years: 5
warranty_electrical_years: 2
warranty_battery_years: 1

# 3D ASSET
asset_available: true
asset_filename: "platform_street_48v_base.glb"

# POPULAR UPGRADES
recommended_options:
  - wheels-chrome-14inch     # Popular aesthetic upgrade
  - roof-extended-solar      # Adds range
  - seating-captain-chairs   # Comfort upgrade
  - audio-bluetooth-basic    # Modern convenience
```

---

## Data Conversion Example

### From Template to System Format

**Template Entry:**
```
Option Name: Chrome Wheels
Option ID: wheels-chrome-14inch
Category: WHEELS
Parts Cost: $800
Labor Hours: 1.5
EXCLUDES: lift-kit-4inch
```

**System Format (JSON):**
```json
{
  "id": "wheels-chrome-14inch",
  "category": "WHEELS",
  "name": "14\" Chrome Alloy Wheels",
  "description": "Premium chrome-plated aluminum wheels...",
  "partPrice": 800.00,
  "laborHours": 1.5,
  "requires": [],
  "excludes": ["lift-kit-4inch"],
  "assetPath": "/assets/gltf/wheels_chrome_14in_v2.glb"
}
```

**Database Entry (SQL):**
```sql
INSERT INTO options (
  id, category, name, description, 
  part_price, labor_hours, asset_path
) VALUES (
  'wheels-chrome-14inch',
  'WHEELS',
  '14" Chrome Alloy Wheels',
  'Premium chrome-plated aluminum wheels...',
  800.00,
  1.5,
  '/assets/gltf/wheels_chrome_14in_v2.glb'
);

INSERT INTO option_excludes (option_id, excludes_option_id)
VALUES ('wheels-chrome-14inch', 'lift-kit-4inch');
```

---

## Pricing Calculation Examples

### Example 1: Basic Configuration

**Configuration:**
- Platform: street-48v ($8,500)
- Wheels: wheels-chrome-14inch ($800 parts + 1.5hr labor)
- Paint: paint-gloss-red (BODY zone: $500 × 1.0 multiplier)

**Calculation:**
```
Platform:          $8,500.00
Chrome Wheels:       $800.00  (parts)
  + Labor:           $127.50  (1.5 hr × $85/hr)
Paint (Red):         $500.00  (body zone base × 1.0)
  + Labor:           $285.00  (3.0 hr × $95/hr)
                   ----------
Subtotal:          $10,212.50
Labor Total:         $412.50
                   ----------
GRAND TOTAL:       $10,212.50
```

### Example 2: Complex Configuration

**Configuration:**
- Platform: street-48v ($8,500)
- Solar Roof: roof-extended-solar ($1,850 + 4hr labor)
- Captain Chairs: seating-captain-chairs ($1,200 + 3hr labor)
- Paint: paint-metallic-blue (BODY: $500 × 1.5 multiplier)
- Upholstery: vinyl-marine-gray (SEATS: $400 × 1.0)

**Calculation:**
```
Platform:               $8,500.00

Options:
  Solar Roof:           $1,850.00
    + Labor:              $380.00  (4.0 hr × $95/hr)
  Captain Chairs:       $1,200.00
    + Labor:              $255.00  (3.0 hr × $85/hr)

Materials:
  Metallic Blue Paint:    $750.00  ($500 × 1.5)
    + Labor:              $285.00  (3.0 hr × $95/hr)
  Gray Vinyl Seats:       $400.00  ($400 × 1.0)
    + Labor:              $127.50  (1.5 hr × $85/hr)
                        ----------
Subtotal:              $13,747.50
Total Labor:            $1,047.50
                        ----------
GRAND TOTAL:           $13,747.50
```

---

## Common Configuration Examples

### Economy Build
- Platform: street-48v
- Paint: white gloss (base price)
- Seats: standard vinyl
- **Total: ~$9,500**

### Popular Build
- Platform: street-48v
- Wheels: chrome 14"
- Roof: extended solar
- Paint: metallic
- Seats: upgraded vinyl
- Audio: basic Bluetooth
- **Total: ~$13,000**

### Premium Build
- Platform: street-48v
- Wheels: chrome 14"
- Roof: extended solar
- Lift: 2" kit
- Paint: custom metallic
- Seats: captain chairs, premium leather
- Audio: premium system
- Lighting: LED underglow
- Storage: rear basket + under-seat
- **Total: ~$17,500**

---

## Validation Examples

### ✅ Valid Configuration
```yaml
platform: street-48v
options:
  - wheels-chrome-14inch
  - roof-extended-solar
  - storage-rear-basket
materials:
  - zone: BODY, material: paint-gloss-red
  - zone: SEATS, material: vinyl-marine-black
```
**Passes all rules. No conflicts.**

### ❌ Invalid Configuration
```yaml
platform: street-48v
options:
  - lift-kit-4inch
  - wheels-chrome-14inch   # ❌ Excluded by lift kit
```
**Error: "Chrome wheels cannot be combined with 4-inch lift kit"**

### ❌ Invalid Configuration
```yaml
platform: street-72v
options:
  - roof-extended-solar    # ❌ Requires 48V platform
```
**Error: "Solar roof only compatible with 48V platform"**

---

## Questions?

This format shows the **end result** after data collection. Your job is to fill out the **template** with this level of detail. The system will handle the conversion.

**Next Step:** Use CONFIGURATOR_INPUT_TEMPLATE.md to provide your information.
