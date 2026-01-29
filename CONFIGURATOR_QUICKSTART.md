# Configurator Data Collection - Quick Start Guide

## For Sales & Engineering Teams

This guide explains how to use the **CONFIGURATOR_INPUT_TEMPLATE.md** to provide the information needed for the cart configurator system.

---

## What We're Building

A web-based 3D configurator (like Nike shoe customizer or Hero Forge) where customers can:
1. Select cart options (wheels, roof, seats, etc.)
2. Choose colors and finishes
3. See real-time 3D preview
4. Get instant pricing
5. Submit quote request

**We need your expertise to define what's possible and what it costs.**

---

## Who Should Fill Out What

### Sales Team 👔
**You know:** Customer preferences, common configurations, pricing, market positioning

**Please complete:**
- ✅ Section 2: Options (names, descriptions, common combos)
- ✅ Section 3: Materials (color options, popular choices)
- ✅ Section 4: Business rules (what customers usually ask for)
- ✅ Section 5: Pricing (customer-facing prices)
- ✅ Section 7: Quote process (timelines, communication)
- ✅ Section 8: Common customer questions

### Engineering Team 🔧
**You know:** Technical constraints, compatibility, build process, parts

**Please complete:**
- ✅ Section 1: Platform specs (weight, dimensions, technical details)
- ✅ Section 2: Options (compatibility, installation complexity)
- ✅ Section 4: Business rules (physical constraints, safety)
- ✅ Section 5: Labor rates (time estimates per task)
- ✅ Section 6: Build timeline (process, phases)
- ✅ Section 8: Problem combinations, safety requirements
- ✅ Section 9: 3D assets (what models exist)

### Production Manager 🏭
**You know:** Labor costs, build capacity, scheduling

**Please complete:**
- ✅ Section 5: Labor rates (actual shop rates)
- ✅ Section 6: Build timeline (realistic schedules)
- ✅ Section 7: Lead times, rush policies

### Finance/Pricing 💰
**You know:** Margins, discounts, payment terms

**Please complete:**
- ✅ Section 5: All pricing sections
- ✅ Section 7: Payment terms, deposits

---

## How to Fill It Out

### Step 1: Review Examples
The template includes examples (in italics) showing the format. Follow those patterns.

### Step 2: Start with Easy Sections
Begin with what you know best:
- Sales: Popular options and colors
- Engineering: Technical specs and constraints
- Production: Build times and labor

### Step 3: Fill Out Option by Option
For **each** option (e.g., "Chrome Wheels", "Solar Roof"):

```
Option Name: [Customer-friendly name]
Option ID: [lowercase-with-dashes]
Category: [Pick from list]
Description: [What customer sees]

Pricing:
- Parts Cost: [Your cost or retail?]
- Labor Hours: [Realistic estimate]

Compatibility:
- REQUIRES: [What must be selected first]
- EXCLUDES: [What can't be combined]
```

**💡 Tip:** If you're not sure about something, write "TBD" or "ASK [person]" and we'll follow up.

### Step 4: Define Rules
The configurator needs to know what **can** and **cannot** be combined:

**Example Rule:**
```
IF customer selects: "Lift Kit"
THEN they MUST also select: "Off-Road Tires"
REASON: Street tires won't fit with lifted suspension
```

### Step 5: Review Together
Once each team completes their sections, we'll review as a group to catch conflicts or missing info.

---

## Common Questions

### Q: How detailed do descriptions need to be?
**A:** Write what you'd tell a customer. 2-3 sentences is perfect.

**Example:**
```
Bad:  "14-inch chrome wheels"
Good: "14-inch chrome-plated aluminum wheels. Mirror finish 
       for show-quality appearance. Includes matching center 
       caps and lug nuts."
```

### Q: What's an "Option ID"?
**A:** A unique code for the system (never shown to customers).

**Format:** lowercase-with-hyphens
```
Good: wheels-chrome-14inch
Good: roof-extended-solar
Good: seating-captain-chairs

Bad:  Chrome Wheels (has spaces/caps)
Bad:  wheels_chrome (use hyphens, not underscores)
```

### Q: How do I know if options conflict?
**A:** Think about:
- Physical space (can both fit?)
- Electrical load (too much power draw?)
- Weight limits (too heavy?)
- Safety (creates hazard?)
- Build process (can't install both)

### Q: What if we offer custom options?
**A:** List the standard templates. Example:
```
Option Name: Custom Rear Deck (Specify Dimensions)
Description: Made-to-order rear cargo deck. Customer 
             provides dimensions during quote process.
```

### Q: Do we need exact prices now?
**A:** Ballpark is fine for Phase 1. We can update later. But we need:
- Relative pricing (this costs more than that)
- Multipliers (metallic paint is 1.5x base)
- Labor hours (even rough estimates)

### Q: What's a "Material Zone"?
**A:** The part of the cart being customized:
- **BODY** - Main panels, sides
- **ROOF** - Top canopy
- **SEATS** - Upholstery
- **METAL** - Frame, hardware
- **GLASS** - Windshield, windows

---

## Priority Information

### Must Have (for Launch) 🔴
We **need** this info to launch:
1. Base platform price
2. 5-10 most popular options (with prices)
3. Basic color palette (5-10 colors)
4. Key compatibility rules
5. Labor rates
6. Basic lead times

### Nice to Have (Phase 2) 🟡
Important but can be added later:
- Full option catalog
- All color variations
- Detailed edge cases
- Rush pricing
- Volume discounts

### Future Enhancements 🟢
We'll get to these eventually:
- Custom fabrication rules
- Advanced electrical configs
- Suspension geometry
- Performance tuning

---

## Example: Complete Option Entry

Here's a fully filled-out option to use as reference:

```
---
OPTION #: 1
---
Option Name: Chrome Alloy Wheels (14")
Option ID: wheels-chrome-14inch
Category: WHEELS
Description: High-polish chrome-plated aluminum wheels. 
             14-inch diameter, 7-inch width. Includes 
             center caps and stainless lug nuts.

Pricing:
- Parts Cost: $800 (set of 4)
- Labor Hours: 1.5
- Labor Rate: $85/hr
- Total Cost: $927.50

Physical Specifications:
- Weight Added: 45 lbs (vs stock)
- Dimensions: 14" diameter x 7" width
- Mounting Points: Standard 4-bolt pattern

Compatibility Rules:
- REQUIRES these options first: none
- EXCLUDES: lift-kit-4inch (clearance issue)
- Compatible with Platform(s): all

Lead Time:
- Stock / Special Order: Special Order
- Days to acquire: 7-10 days

3D Asset Notes:
- Asset available? Yes
- Asset file name: wheels_chrome_14in_v2.glb
- Vendor: American Racing, Model AR-172

Special Notes: Popular upgrade. Chrome requires 
               periodic maintenance to prevent oxidation.
               Recommend ceramic coating for $150.
```

---

## Red Flags to Watch For

🚩 **Missing compatibility rules**
- Every option should have either "requires", "excludes", or explicitly say "none"

🚩 **Inconsistent pricing**
- If Option A + Option B together cost less than buying separately, check if that's intentional

🚩 **Impossible combinations**
- Example: "Requires solar roof" but "Excludes all roof options" ← contradiction

🚩 **Missing labor estimates**
- Every option needs install time (even if it's "0.5 hours")

🚩 **Vague descriptions**
- "Good quality seats" → Be specific: "Marine-grade vinyl, UV-resistant, 2-year warranty"

---

## Validation Checklist

Before submitting, verify:

- [ ] Every option has a unique ID
- [ ] All prices are in USD
- [ ] Labor hours are estimated for each option
- [ ] Compatibility rules are defined (even if "none")
- [ ] Descriptions are customer-friendly
- [ ] Technical specs are complete (weight, dimensions)
- [ ] Lead times are realistic
- [ ] No obvious conflicts in rules

---

## What Happens Next

1. **Collection** (1-2 weeks)
   - Teams fill out their sections
   - Questions answered via [communication channel]

2. **Review Meeting** (1 day)
   - All teams review together
   - Resolve conflicts
   - Fill gaps

3. **Data Import** (3-5 days)
   - Tech team enters data into system
   - Creates seed data files
   - Validates all rules

4. **Testing** (1 week)
   - Build test configurations
   - Verify pricing calculations
   - Check rule enforcement

5. **Soft Launch** (2 weeks)
   - Internal use only
   - Gather feedback
   - Refine options

6. **Full Launch**
   - Public release
   - Customer access
   - Ongoing updates

---

## Contact Information

**Questions about:**
- Technical constraints → [Engineering Lead]
- Pricing/margins → [Finance]
- Customer preferences → [Sales Manager]
- Build process → [Production Manager]
- System/template → [Tech Lead]

**Deadline:** [Insert Date]

**Submit to:** [Email/System]

---

## Tips for Success

### ✅ DO:
- Be specific ("2-inch lift" not "bigger lift")
- Include units (pounds, inches, hours)
- Think about real customer questions
- Note special cases or exceptions
- Ask questions if unsure

### ❌ DON'T:
- Leave sections blank (write "N/A" if not applicable)
- Use internal jargon (customer won't know what "P4 motor" means)
- Guess wildly on prices (ballpark is fine, but flag it)
- Forget about install time (even simple parts take time)
- Ignore safety requirements

---

## Example Questions for Your Team

**Ask yourselves:**

1. **Sales:** What do 80% of customers order?
2. **Engineering:** What physically cannot be combined?
3. **Production:** What options slow down the build?
4. **Everyone:** What questions do customers always ask?

---

## Appendix: Category Descriptions

**SEATING** - Anything related to seats
- Number of seats
- Seat type (bench, captain, rear-facing)
- Upholstery options

**ROOF** - Canopy and roof systems
- Roof size (standard, extended)
- Solar panels
- Material (soft top, hard top)

**WHEELS** - Wheels and tires
- Wheel size, material, finish
- Tire type (street, all-terrain, off-road)
- Wheel accessories

**LIGHTING** - All lights
- Headlights, taillights
- Underglow, accent lights
- Work lights, light bars

**STORAGE** - Cargo and storage
- Rear baskets/racks
- Under-seat storage
- Cargo beds, dump boxes

**ELECTRONICS** - Electrical accessories
- Audio systems
- Cameras (backup, dashcam)
- GPS, displays
- USB ports, outlets

**SUSPENSION** - Suspension and lift
- Lift kits (height)
- Shock upgrades
- Spring options

**FABRICATION** - Custom metalwork
- Extended frames
- Custom decks
- Specialized mounts

---

**Need Help?** Don't hesitate to ask! It's better to ask now than guess wrong.

**Thank you for your expertise! This information is critical to building a world-class configurator.** 🎉
