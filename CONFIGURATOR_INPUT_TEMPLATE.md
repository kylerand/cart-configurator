# Golf Cart Configurator - Data Collection Template

## Purpose

This document is used to collect product configuration information from Sales and Engineering teams. The information gathered here will define:
- Available customization options
- Pricing for parts and labor
- Business rules (what can/cannot be combined)
- Material finishes and colors
- Build complexity and constraints

**Please fill out all sections completely. The more detail provided, the more accurate the configurator will be.**

---

## Section 1: Platform Information

**Platform Definition:** The base cart model that everything else builds upon.

| Field | Value |
|-------|-------|
| Platform Name | *(e.g., "Street Legal 48V", "Off-Road 4x4")* |
| Platform ID | *(unique code, e.g., "street-48v")* |
| Description | *(brief description for customers)* |
| Base Price (USD) | $ |
| Estimated Build Time (hours) | |
| Weight Capacity (lbs) | |
| Default Wheelbase (inches) | |
| Default Track Width (inches) | |

**Notes / Special Requirements:**
```
(Add any technical notes, legal requirements, or special considerations)
```

---

## Section 2: Configuration Options

**Instructions:** List all available customization options. Each option should be filled out completely.

### Option Template

Copy this template for each option:

```
---
OPTION #: ___
---
Option Name: 
Option ID: (unique code, lowercase-with-dashes)
Category: (SEATING / ROOF / WHEELS / LIGHTING / STORAGE / ELECTRONICS / SUSPENSION / FABRICATION)
Description: (customer-facing description)

Pricing:
- Parts Cost: $
- Labor Hours: 
- Labor Rate: $ /hr (or use shop standard)
- Total Cost: $

Physical Specifications:
- Weight Added: ___ lbs
- Dimensions: ___ x ___ x ___ inches
- Mounting Points: 

Compatibility Rules:
- REQUIRES these options first: (list option IDs, or "none")
  
- EXCLUDES / Cannot be combined with: (list option IDs, or "none")
  
- Compatible with Platform(s): (all, or list specific)

Lead Time:
- Stock / Special Order / Custom Fabrication? 
- Days to acquire: 

3D Asset Notes:
- Asset available? Yes / No
- Asset file name (if known): 
- Vendor/Model info: 

Special Notes:
```

---

### Seating Options

**Option 1:**
```
Option Name: 
Option ID: 
Category: SEATING
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Compatibility Rules:
- REQUIRES: 
- EXCLUDES: 
- Compatible with Platform(s): 

Notes:
```

**Option 2:**
```
(repeat for each seating option)
```

---

### Roof Options

**Option 1:**
```
Option Name: 
Option ID: 
Category: ROOF
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Compatibility Rules:
- REQUIRES: 
- EXCLUDES: 
- Compatible with Platform(s): 

Solar Roof Specifics (if applicable):
- Wattage: 
- Voltage: 
- Charging rate: 

Notes:
```

**Option 2:**
```
(repeat for each roof option)
```

---

### Wheel & Tire Options

**Option 1:**
```
Option Name: 
Option ID: 
Category: WHEELS
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Wheel Specifications:
- Size: ___ inch diameter
- Width: ___ inches
- Bolt Pattern: 
- Offset: 
- Material: (steel/aluminum/chrome)

Tire Specifications:
- Size: ___x___-___
- Type: (street/all-terrain/off-road)
- Load Rating: 
- Speed Rating: 

Compatibility Rules:
- REQUIRES: (e.g., lift kit for oversized)
- EXCLUDES: 
- Works with: (standard/lifted suspension)

Notes:
```

**Option 2:**
```
(repeat for each wheel option)
```

---

### Lighting Options

**Option 1:**
```
Option Name: 
Option ID: 
Category: LIGHTING
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Electrical Specifications:
- Voltage: 
- Wattage/Amps: 
- LED / Halogen / Other: 
- Requires upgraded wiring? Yes / No

Compatibility Rules:
- REQUIRES: 
- EXCLUDES: 
- Legal for street use? Yes / No / Depends

Notes:
```

---

### Storage Options

**Option 1:**
```
Option Name: 
Option ID: 
Category: STORAGE
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Storage Specifications:
- Capacity: ___ cubic inches (or dimensions)
- Weight Capacity: ___ lbs
- Location: (rear/under-seat/front)
- Lockable? Yes / No

Compatibility Rules:
- REQUIRES: 
- EXCLUDES: 
- Compatible with Platform(s): 

Notes:
```

---

### Electronics Options

**Option 1:**
```
Option Name: (e.g., "Bluetooth Audio System", "Backup Camera")
Option ID: 
Category: ELECTRONICS
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Electronics Specifications:
- Power Requirements: ___ V, ___ A
- Features: 
- Installation Complexity: Simple / Moderate / Complex
- Requires upgraded electrical? Yes / No

Compatibility Rules:
- REQUIRES: 
- EXCLUDES: 
- Compatible with Platform(s): 

Warranty:
- Manufacturer: 
- Duration: 

Notes:
```

---

### Suspension Options

**Option 1:**
```
Option Name: (e.g., "2-inch Lift Kit", "Air Suspension")
Option ID: 
Category: SUSPENSION
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Suspension Specifications:
- Lift Height: ___ inches
- Type: (coil-over/leaf-spring/air)
- Ground Clearance Added: ___ inches
- Affects handling? (describe)

Compatibility Rules:
- REQUIRES: (e.g., specific wheel sizes)
- EXCLUDES: 
- Compatible with Platform(s): 

Impact on Performance:
- Top Speed Change: 
- Range Change: 
- Stability Notes: 

Notes:
```

---

### Custom Fabrication Options

**Option 1:**
```
Option Name: (e.g., "Custom Rear Deck", "Extended Frame")
Option ID: 
Category: FABRICATION
Description: 

Pricing:
- Parts Cost: $
- Labor Hours: 
- Total Cost: $

Fabrication Specifications:
- Materials: (steel/aluminum)
- Process: (welding/bolting/both)
- Paint/Coating: 
- Engineering Required? Yes / No

Compatibility Rules:
- REQUIRES: 
- EXCLUDES: 
- Compatible with Platform(s): 

Lead Time:
- Design Time: ___ days
- Fabrication Time: ___ days
- Total: ___ days

Notes:
```

---

## Section 3: Material Finishes & Colors

### Paint Options (Body & Roof)

**Instructions:** List all available paint colors and finishes.

| Material ID | Color Name | Color Code (Hex) | Finish Type | Price Multiplier | Lead Time | Notes |
|-------------|------------|------------------|-------------|------------------|-----------|-------|
| *(example)* | Gloss White | #FFFFFF | Gloss | 1.0x (base) | Stock | Standard |
| | | | Gloss/Matte/Satin/Metallic | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |

**Custom Color Notes:**
- Do you offer custom color matching? Yes / No
- Custom color upcharge: $___
- Custom color lead time: ___ days

---

### Powder Coat Options (Metal Frame & Parts)

| Material ID | Color Name | Color Code (Hex) | Finish Type | Price Multiplier | Lead Time | Notes |
|-------------|------------|------------------|-------------|------------------|-----------|-------|
| | | | Gloss/Matte/Satin | | | |
| | | | | | | |
| | | | | | | |

---

### Vinyl/Fabric Options (Seats)

| Material ID | Color/Pattern Name | Color Code (Hex) | Material Type | Price Multiplier | Durability Rating | Notes |
|-------------|-------------------|------------------|---------------|------------------|-------------------|-------|
| | | | Marine Vinyl / Fabric | | (UV/Water resistance) | |
| | | | | | | |
| | | | | | | |

**Seat Material Notes:**
- Stitching color options: 
- Embroidery/logo available? Yes / No
- Custom upholstery lead time: ___ days

---

### Glass Tint Options (Windshield/Windows)

| Material ID | Tint Level | Transmission % | Price Multiplier | Street Legal? | Notes |
|-------------|-----------|----------------|------------------|---------------|-------|
| | Clear | 95% | 1.0x | Yes | |
| | Light Tint | 70% | | | |
| | Medium Tint | 50% | | | |
| | Dark Tint | 30% | | | |

---

## Section 4: Business Rules & Constraints

### Option Combination Rules

**Instructions:** Define which options must or cannot be combined.

#### Required Combinations

```
IF customer selects: _______________
THEN they MUST also select: _______________
REASON: 
```

```
IF customer selects: _______________
THEN they MUST also select: _______________
REASON: 
```

*(Add more as needed)*

---

#### Excluded Combinations

```
Option A: _______________
CANNOT be combined with: _______________
REASON: 
```

```
Option A: _______________
CANNOT be combined with: _______________
REASON: 
```

*(Add more as needed)*

---

### Platform-Specific Restrictions

**Platform: _____________**

Options NOT available for this platform:
- 
- 
- 

Reason: 

---

### Weight & Balance Rules

```
Maximum Total Weight: ___ lbs
Maximum Tongue Weight: ___ lbs
Maximum Rear Overhang: ___ inches

Weight Warnings:
- IF total weight > ___ lbs, WARN: 
- IF rear weight > ___ lbs, WARN: 
```

---

### Electrical System Limits

```
Base Electrical System Capacity: ___ Amps at ___ Volts

Option combinations that trigger electrical upgrade:
- 
- 
- 

Upgraded Electrical System:
- Capacity: ___ Amps
- Cost: $___
- Labor: ___ hours
```

---

### Performance Impact Rules

```
IF [option] is selected:
- Top Speed: +/- ___ mph
- Range: +/- ___ miles
- Hill Climbing: +/- ___ %

IF [option] is selected:
- Top Speed: +/- ___ mph
- Range: +/- ___ miles
- Hill Climbing: +/- ___ %
```

---

## Section 5: Pricing Structure

### Labor Rates

| Task Type | Rate per Hour | Notes |
|-----------|---------------|-------|
| Standard Assembly | $___/hr | Basic bolt-on parts |
| Electrical Work | $___/hr | Wiring, electronics |
| Custom Fabrication | $___/hr | Welding, metalwork |
| Paint/Powder Coat | $___/hr | Surface prep + finish |
| Upholstery | $___/hr | Seat covers, vinyl work |

---

### Base Platform Pricing

| Platform | Base Price | Includes | Build Time |
|----------|------------|----------|------------|
| | $__ | (list what's included) | __ hrs |
| | $__ | | __ hrs |

---

### Material Zone Base Prices

*(Used with material price multipliers)*

| Zone | Base Price | Notes |
|------|------------|-------|
| Body Paint | $__ | Per full body paint job |
| Roof Paint | $__ | Per roof section |
| Seat Upholstery | $__ | Per seat (set of 2) |
| Frame Powder Coat | $__ | Full frame |
| Glass Tint | $__ | Per windshield/window |

**Example Calculation:**
- Body Paint Base: $500
- Metallic Paint Multiplier: 1.5x
- Final Price: $500 × 1.5 = $750

---

### Discount Structure

```
Volume Discounts:
- 2-3 carts: ___% off
- 4-5 carts: ___% off
- 6+ carts: ___% off

Fleet Orders (10+):
- Discount: ___% off
- Payment Terms: 
- Delivery Schedule: 

Package Deals:
- Package Name: _______________
  Includes: 
  Regular Price: $___
  Package Price: $___
  Savings: $___
```

---

### Deposit & Payment Terms

```
Deposit Required: $__ or ___%
Due at: (quote acceptance / build start / other)

Payment Schedule:
- Deposit: ___%
- Progress Payment: ___% (at _____________)
- Final Payment: ___% (at delivery/pickup)

Cancellation Policy:
- Deposit refundable? Yes / No / Partial
- Restocking fee: ___%
- Custom work non-refundable: Yes / No
```

---

## Section 6: Build Process & Timeline

### Typical Build Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Design Review | ___ days | Quote creation, customer approval |
| Parts Procurement | ___ days | Ordering parts/materials |
| Base Assembly | ___ days | Platform + basic systems |
| Option Installation | ___ days | Add-on features |
| Paint/Finishing | ___ days | Body work, powder coat |
| Upholstery | ___ days | Seat installation |
| Quality Check | ___ days | Testing, inspection |
| **Total Lead Time** | **___ days** | |

---

### Build Complexity Tiers

**Tier 1 - Simple Build (Stock + Basic Options)**
- Example Config: 
- Typical Lead Time: ___ weeks
- Options in this tier: 

**Tier 2 - Moderate Build (Multiple Options)**
- Example Config: 
- Typical Lead Time: ___ weeks
- Options in this tier: 

**Tier 3 - Complex Build (Custom Fabrication)**
- Example Config: 
- Typical Lead Time: ___ weeks
- Options in this tier: 

---

### Rush Order Policy

```
Rush Build Available? Yes / No
Rush Fee: $__ or ___%
Minimum Lead Time (rush): ___ days
Restrictions: 
```

---

## Section 7: Quote & Customer Information

### Quote Validity

```
Quote valid for: ___ days
Price lock period: ___ days (for approved orders)
Price adjustment policy: 
```

---

### Customer Communication

**What should quotes include?**
- [ ] Itemized parts list
- [ ] Labor breakdown
- [ ] Material specifications
- [ ] Estimated completion date
- [ ] Warranty information
- [ ] Payment schedule
- [ ] 3D renderings / photos
- [ ] Other: _______________

**Follow-up Process:**
- Initial contact response time: ___ hours
- Quote delivery time: ___ business days
- Customer review period: ___ days
- Follow-up cadence: 

---

### Warranty & Support

```
Standard Warranty:
- Platform/Frame: ___ years
- Electrical: ___ years
- Battery: ___ years / ___ cycles
- Upholstery: ___ year(s)
- Paint/Powder Coat: ___ year(s)
- Accessories: ___ year(s)

Extended Warranty Available? Yes / No
- Cost: $___
- Coverage: 

Maintenance Plan Available? Yes / No
- Cost: $___/year
- Includes: 
```

---

## Section 8: Validation & Edge Cases

### Common Customer Requests

**Question 1:** "Can I get a lifted cart with street tires?"
- **Answer:** Yes / No
- **If No, Why:** 
- **Alternative:** 

**Question 2:** "Can I add more than 4 seats?"
- **Answer:** Yes / No
- **If Yes, Max Seats:** ___
- **Requires:** 

**Question 3:** "Can I use this on the street?"
- **Answer:** Depends on platform/config
- **Requirements:** 
  - [ ] Headlights/Taillights
  - [ ] Turn signals
  - [ ] Horn
  - [ ] Mirrors
  - [ ] DOT tires
  - [ ] VIN plate
  - [ ] Other: ___

**Question 4:** "What's the most popular configuration?"
- **Answer:** 

*(Add more common questions)*

---

### Known Problem Combinations

```
ISSUE #1:
Config: 
Problem: 
Solution/Workaround: 
Status: (known issue / engineering review / resolved)
```

```
ISSUE #2:
Config: 
Problem: 
Solution/Workaround: 
Status: 
```

---

### Safety Requirements

```
Required Safety Features (all carts):
- [ ] _______________
- [ ] _______________
- [ ] _______________

Optional Safety Features:
- [ ] _______________ (recommended for: _______)
- [ ] _______________ (required for: _______)

Safety Warnings to Display:
- IF [option]: WARN "_______________"
- IF [option]: WARN "_______________"
```

---

## Section 9: Technical Integration Notes

### 3D Assets Status

**Available Now:**
- [ ] Base platform model
- [ ] Wheels (list types): 
- [ ] Roof (list types): 
- [ ] Seats (list types): 
- [ ] Other: 

**Coming Soon:**
- [ ] _______________ (ETA: _______)
- [ ] _______________ (ETA: _______)

**Not Available / Use Placeholders:**
- [ ] _______________
- [ ] _______________

---

### Option Categories Priority

**Phase 1 - Must Have (Launch):**
- [ ] Seating
- [ ] Roof
- [ ] Wheels
- [ ] Paint Colors
- [ ] (others?)

**Phase 2 - Nice to Have:**
- [ ] Lighting
- [ ] Storage
- [ ] Electronics

**Phase 3 - Future:**
- [ ] Suspension
- [ ] Custom Fabrication

---

## Section 10: Review & Sign-Off

**Completed By:**

| Name | Role | Department | Date | Signature |
|------|------|------------|------|-----------|
| | Sales Manager | | | |
| | Engineering Lead | | | |
| | Production Manager | | | |
| | Finance/Pricing | | | |

---

**Review Notes:**
```
(Add any additional notes, concerns, or items needing clarification)
```

---

**Next Steps:**
1. [ ] Review for completeness
2. [ ] Engineering validation
3. [ ] Pricing approval
4. [ ] Legal/compliance review
5. [ ] Import into configurator system
6. [ ] Test with sample configurations
7. [ ] Final approval for production

---

## Appendix: Quick Reference

### Option ID Naming Convention

Use lowercase with hyphens:
- `seating-bench-standard`
- `roof-extended-solar`
- `wheels-chrome-14inch`
- `lighting-underglow-rgb`
- `storage-rear-basket`

### Material ID Naming Convention

Use descriptive names:
- `paint-gloss-red`
- `powdercoat-black-satin`
- `vinyl-seat-marine-gray`
- `glass-tint-medium`

### Category Codes

- `SEATING` - Seats and seating configurations
- `ROOF` - Roof types and solar options
- `WHEELS` - Wheels and tires
- `LIGHTING` - All lighting (headlights, underglow, etc.)
- `STORAGE` - Baskets, compartments, cargo
- `ELECTRONICS` - Audio, cameras, accessories
- `SUSPENSION` - Lift kits, suspension upgrades
- `FABRICATION` - Custom metalwork, extended frames

---

**End of Template**

*Please return completed document to: [contact info]*
*Questions? Contact: [tech lead info]*
*Deadline: [date]*
