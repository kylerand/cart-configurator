# Admin Panel Architecture

## Overview

Build an in-app admin panel where Sales, Engineering, and Production teams can manage:
- Platforms
- Configuration options
- Materials & finishes
- Business rules (requires/excludes)
- Pricing
- 3D assets

**Benefits over static forms:**
- ✅ Real-time updates (no import process)
- ✅ Role-based access control
- ✅ Built-in validation
- ✅ Preview configurations immediately
- ✅ Audit trail of changes
- ✅ No technical knowledge required

---

## Architecture

### Tech Stack
- **Frontend:** React + TypeScript + React Router
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand (existing)
- **Backend:** Express + Prisma
- **Database:** SQLite (existing) → Add admin tables
- **Auth:** JWT tokens with role-based permissions

### User Roles

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // Full access
  ADMIN = 'ADMIN',               // Manage options/materials
  SALES = 'SALES',               // Edit descriptions, pricing
  ENGINEERING = 'ENGINEERING',   // Edit specs, compatibility
  PRODUCTION = 'PRODUCTION',     // Edit labor hours, lead times
  VIEWER = 'VIEWER',             // Read-only access
}
```

**Permissions Matrix:**

| Action | Super Admin | Admin | Sales | Engineering | Production | Viewer |
|--------|-------------|-------|-------|-------------|------------|--------|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Options | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Pricing | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Edit Specs | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Edit Descriptions | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Rules | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage Materials | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Only | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Database Schema Updates

### New Tables

```prisma
// Admin Users
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   // UserRole enum
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  lastLoginAt  DateTime?
  
  auditLogs    AuditLog[]
}

// Platforms (moved from seed to DB)
model Platform {
  id               String   @id
  name             String
  description      String
  basePrice        Float
  defaultAssetPath String
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  createdBy        String?
  
  options          Option[]
}

// Options (moved from seed to DB)
model Option {
  id          String   @id
  platformId  String
  category    String   // OptionCategory enum
  name        String
  description String
  partPrice   Float
  laborHours  Float
  assetPath   String
  isActive    Boolean  @default(true)
  
  // Specifications (JSON)
  specifications String @default("{}")
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  
  platform    Platform @relation(fields: [platformId], references: [id])
  
  // Relations
  requires    OptionRelation[] @relation("RequiresRelation")
  excludes    OptionRelation[] @relation("ExcludesRelation")
  
  @@index([platformId])
  @@index([category])
  @@index([isActive])
}

// Option Compatibility Rules
model OptionRelation {
  id          String   @id @default(uuid())
  optionId    String
  relatedId   String
  type        String   // REQUIRES | EXCLUDES
  reason      String?  // Human-readable explanation
  
  createdAt   DateTime @default(now())
  createdBy   String?
  
  option      Option @relation("RequiresRelation", fields: [optionId], references: [id])
  related     Option @relation("ExcludesRelation", fields: [relatedId], references: [id])
  
  @@unique([optionId, relatedId, type])
  @@index([optionId])
  @@index([type])
}

// Materials (moved from seed to DB)
model Material {
  id              String   @id
  zone            String   // MaterialZone enum
  type            String   // MaterialType enum
  name            String
  description     String
  color           String   // hex
  finish          String   // MaterialFinish enum
  priceMultiplier Float
  isActive        Boolean  @default(true)
  
  // Specifications (JSON)
  specifications  String   @default("{}")
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?
  
  @@index([zone])
  @@index([type])
  @@index([isActive])
}

// Audit Log for tracking changes
model AuditLog {
  id          String   @id @default(uuid())
  userId      String
  action      String   // CREATE | UPDATE | DELETE
  entityType  String   // Platform | Option | Material | User
  entityId    String
  changes     String   // JSON of what changed
  timestamp   DateTime @default(now())
  ipAddress   String?
  
  user        User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([entityType])
  @@index([timestamp])
}
```

---

## Admin Panel Structure

### URL Structure

```
/admin                         → Admin dashboard
/admin/login                   → Login page

/admin/platforms               → Platform list
/admin/platforms/new           → Create platform
/admin/platforms/:id           → Edit platform
/admin/platforms/:id/options   → Options for platform

/admin/options                 → Option list (all platforms)
/admin/options/new             → Create option
/admin/options/:id             → Edit option
/admin/options/:id/rules       → Compatibility rules

/admin/materials               → Material list
/admin/materials/new           → Create material
/admin/materials/:id           → Edit material

/admin/rules                   → Rule management (global view)
/admin/rules/validator         → Test configurations

/admin/pricing                 → Pricing overview
/admin/pricing/labor-rates     → Labor rate settings

/admin/users                   → User management (Super Admin only)
/admin/users/new               → Create user
/admin/users/:id               → Edit user

/admin/audit                   → Audit log viewer
/admin/preview                 → Configuration preview
```

### Page Layouts

```
┌─────────────────────────────────────────┐
│ Admin Header                             │
│ [Logo] [Navigation] [User Menu]         │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │   Main Content Area          │
│          │                              │
│ - Home   │   [Page Title]               │
│ - Platf. │   [Breadcrumbs]              │
│ - Options│                              │
│ - Mater. │   [Content...]               │
│ - Rules  │                              │
│ - Users  │                              │
│ - Audit  │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

---

## Key Features

### 1. Platform Management

**List View:**
- Table showing all platforms
- Columns: Name, Base Price, Options Count, Status, Actions
- Search/filter by status
- Bulk actions (activate/deactivate)

**Create/Edit Form:**
```
Platform Details
├── Name *
├── Description *
├── Base Price * ($)
├── Default Asset Path
├── Specifications
│   ├── Voltage
│   ├── Battery Type
│   ├── Top Speed
│   ├── Range
│   ├── Wheelbase
│   └── Weight Capacity
├── Status (Active/Inactive)
└── [Save] [Cancel]
```

### 2. Option Management

**List View:**
- Filterable table (by category, platform, status)
- Quick edit inline
- Bulk operations
- Export to CSV

**Create/Edit Form:**
```
Option Information
├── Basic Info
│   ├── Option ID * (auto-generated from name)
│   ├── Name *
│   ├── Category * (dropdown)
│   ├── Description * (rich text)
│   └── Platform * (dropdown)
│
├── Pricing
│   ├── Parts Cost * ($)
│   ├── Labor Hours *
│   └── Total Cost (calculated)
│
├── Specifications
│   ├── Weight Added (lbs)
│   ├── Dimensions
│   └── Custom Fields (JSON editor)
│
├── Compatibility Rules
│   ├── Requires (multi-select)
│   ├── Excludes (multi-select)
│   └── [Add Rule]
│
├── 3D Asset
│   ├── Asset Path
│   ├── Asset Upload (file picker)
│   └── [Preview]
│
├── Status
│   └── Active/Inactive toggle
│
└── [Save] [Save & Add Another] [Cancel]
```

**Field-Level Permissions:**
- Sales can edit: Name, Description, Parts Cost
- Engineering can edit: Specifications, Compatibility Rules
- Production can edit: Labor Hours
- Admin can edit: Everything

### 3. Material Management

**List View:**
- Grouped by zone
- Color swatches visible
- Filter by type, finish
- Preview materials on 3D model

**Create/Edit Form:**
```
Material Details
├── Basic Info
│   ├── Material ID * (auto-generated)
│   ├── Name *
│   ├── Description *
│   ├── Zone * (dropdown)
│   └── Type * (dropdown)
│
├── Appearance
│   ├── Color * (color picker + hex input)
│   ├── Finish * (dropdown: Gloss/Matte/Satin/Metallic)
│   └── PBR Preset (dropdown - auto-selected)
│
├── Pricing
│   ├── Base Price ($)
│   └── Price Multiplier (×)
│
├── Specifications
│   ├── Durability Rating
│   ├── UV Resistance
│   └── Warranty (years)
│
├── Preview
│   └── [3D Preview with material applied]
│
└── [Save] [Cancel]
```

### 4. Rule Management

**Visual Rule Builder:**
```
IF option [dropdown] is selected
THEN customer MUST select one of:
  [multi-select dropdown]
REASON: [text input]

[Add Rule] [Test Rule]
```

**Rule Validator:**
- Input a configuration (select options)
- See which rules pass/fail
- Explain why rules fail
- Suggest fixes

### 5. Pricing Dashboard

**Overview:**
- Labor rates by task type
- Material base prices by zone
- Discount structure
- Average configuration price

**Labor Rate Settings:**
```
Task Type               Rate/Hour    Last Updated
─────────────────────────────────────────────────
Standard Assembly       $75          2024-01-15
Electrical Work         $95          2024-01-15
Custom Fabrication      $125         2024-01-10
Paint/Powder Coat       $85          2024-01-15
Upholstery             $90          2024-01-20

[Edit Rates]
```

### 6. User Management (Super Admin Only)

**List View:**
- All users with roles
- Last login timestamp
- Status (active/inactive)

**Create/Edit Form:**
```
User Details
├── Name *
├── Email *
├── Role * (dropdown)
├── Password (set/reset)
├── Status (Active/Inactive)
└── [Save] [Send Invite Email]
```

### 7. Audit Log

**Viewer:**
```
Timestamp           User            Action    Entity         Details
──────────────────────────────────────────────────────────────────────
2024-01-29 10:15   john@company   UPDATE    Option         Changed pricing
2024-01-29 10:10   sarah@company  CREATE    Material       Added new color
2024-01-29 09:45   mike@company   DELETE    Rule           Removed conflict
2024-01-29 09:30   john@company   UPDATE    Option         Changed description

[Export] [Filter by User] [Filter by Date] [Filter by Entity Type]
```

**Details Modal:**
```
Change Details
─────────────
User: john@company.com
Action: UPDATE
Entity: Option (wheels-chrome-14inch)
Timestamp: 2024-01-29 10:15:32

Changes:
  partPrice: 750.00 → 800.00
  description: "Chrome wheels..." → "Premium chrome wheels..."

[Close]
```

---

## API Endpoints

### Authentication
```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
POST   /api/admin/auth/refresh
GET    /api/admin/auth/me
```

### Platforms
```
GET    /api/admin/platforms           List all
POST   /api/admin/platforms           Create
GET    /api/admin/platforms/:id       Get one
PUT    /api/admin/platforms/:id       Update
DELETE /api/admin/platforms/:id       Delete (soft)
```

### Options
```
GET    /api/admin/options                  List all
GET    /api/admin/options?platform=:id     Filter by platform
POST   /api/admin/options                  Create
GET    /api/admin/options/:id              Get one
PUT    /api/admin/options/:id              Update (respects permissions)
PATCH  /api/admin/options/:id/activate     Toggle status
DELETE /api/admin/options/:id              Delete (soft)
POST   /api/admin/options/:id/duplicate    Clone option
```

### Option Rules
```
GET    /api/admin/options/:id/rules        Get rules for option
POST   /api/admin/rules                    Create rule
DELETE /api/admin/rules/:id                Delete rule
POST   /api/admin/rules/validate           Test configuration
```

### Materials
```
GET    /api/admin/materials                List all
GET    /api/admin/materials?zone=:zone     Filter by zone
POST   /api/admin/materials                Create
GET    /api/admin/materials/:id            Get one
PUT    /api/admin/materials/:id            Update
DELETE /api/admin/materials/:id            Delete (soft)
```

### Users
```
GET    /api/admin/users                    List all (Super Admin)
POST   /api/admin/users                    Create (Super Admin)
GET    /api/admin/users/:id                Get one
PUT    /api/admin/users/:id                Update
DELETE /api/admin/users/:id                Deactivate
```

### Audit
```
GET    /api/admin/audit                    List logs
GET    /api/admin/audit/:id                Get details
GET    /api/admin/audit/export             Export CSV
```

### Pricing
```
GET    /api/admin/pricing/labor-rates      Get rates
PUT    /api/admin/pricing/labor-rates      Update rates
GET    /api/admin/pricing/material-bases   Get base prices
PUT    /api/admin/pricing/material-bases   Update bases
```

---

## Security

### Authentication
- JWT tokens (access + refresh)
- httpOnly cookies for tokens
- CSRF protection
- Rate limiting on auth endpoints

### Authorization
- Middleware checks role per endpoint
- Field-level permissions in forms
- Audit log for all changes
- IP address logging

### Validation
- Zod schemas for all inputs
- Server-side validation always
- Client-side for UX only
- Sanitize HTML in descriptions

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Update Prisma schema
- [ ] Run migrations
- [ ] Create auth system (JWT)
- [ ] Build admin layout shell
- [ ] Implement user management

### Phase 2: Core Management (Week 2)
- [ ] Platform CRUD
- [ ] Option CRUD
- [ ] Material CRUD
- [ ] Basic forms with validation

### Phase 3: Advanced Features (Week 3)
- [ ] Rule builder UI
- [ ] Configuration validator
- [ ] Pricing dashboard
- [ ] Field-level permissions

### Phase 4: Polish (Week 4)
- [ ] Audit log viewer
- [ ] Bulk operations
- [ ] Export functionality
- [ ] 3D preview integration

### Phase 5: Testing & Launch (Week 5)
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Training documentation
- [ ] Production deployment

---

## Technology Choices

### UI Library
**Recommendation:** Shadcn/ui + Tailwind CSS
- Pre-built components
- Accessible by default
- Customizable
- Works with React Hook Form

### Form Management
**Recommendation:** React Hook Form + Zod
- Type-safe validation
- Great performance
- Field-level permissions
- Already using Zod in types

### Table Component
**Recommendation:** TanStack Table (React Table v8)
- Sorting, filtering, pagination
- Column visibility
- Bulk selection
- Export functionality

### Rich Text Editor (for descriptions)
**Recommendation:** Tiptap
- Lightweight
- Markdown support
- Easy customization
- Good TypeScript support

### File Upload (for 3D assets)
**Recommendation:** react-dropzone
- Drag & drop
- File validation
- Preview support

---

## User Experience

### Dashboard Widgets
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Total Options   │ Active Materials│ Pending Changes │
│     42          │       28        │      3          │
└─────────────────┴─────────────────┴─────────────────┘

Recent Activity
├── Sarah added "Carbon Fiber Roof" option
├── John updated pricing for chrome wheels
└── Mike created 3 new vinyl materials

Quick Actions
├── [Add Option]
├── [Add Material]
└── [View Audit Log]
```

### Inline Editing
- Click to edit fields directly in tables
- Auto-save with visual feedback
- Undo capability

### Keyboard Shortcuts
- `Ctrl+S` - Save form
- `Ctrl+K` - Quick search
- `Esc` - Close modal
- `Ctrl+N` - New item

### Mobile Responsive
- Works on tablets
- Critical features available
- Simplified UI for small screens

---

## Advantages Over Static Forms

| Aspect | Static Forms | Admin Panel |
|--------|--------------|-------------|
| Updates | Manual import | Instant |
| Validation | After submission | Real-time |
| Collaboration | Email/merge conflicts | Simultaneous editing |
| Preview | After import | Immediate |
| Audit Trail | None | Full history |
| Learning Curve | Understand template | Guided UI |
| Data Quality | Varies | Enforced |
| Permissions | File access | Role-based |

---

## Next Steps

1. **Review this architecture** with your team
2. **Prioritize features** (what's must-have vs nice-to-have)
3. **Define roles** (who needs what access)
4. **Start with Phase 1** (auth + basic CRUD)
5. **Iterate quickly** with user feedback

Want me to start building this? I can begin with:
- Database migrations
- Auth system
- First admin page (e.g., Platform management)
