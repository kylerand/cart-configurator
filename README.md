# Golf Cart Configurator

A production-quality 3D golf cart configurator built with TypeScript, React, Three.js, and Node.js. This system allows customers to configure custom fabricated golf carts with real-time 3D visualization, rule-based option validation, and itemized pricing.

## Architecture Overview

This is a **monorepo** application with clean separation between core business logic and application layers:

```
/apps
  /web          - React/Vite frontend with Three.js 3D scene
  /api          - Express backend with Prisma/SQLite
/packages
  /types        - Core TypeScript type definitions
  /config       - Configuration management utilities
  /pricing      - Pure pricing calculation engine
  /rules        - Constraint validation engine
```

### Key Architectural Principles

1. **Strong Typing**: Strict TypeScript everywhere, no `any` types
2. **Pure Functions**: Core engines (pricing, rules) are deterministic and testable
3. **Immutable Updates**: Configuration changes return new objects
4. **Single Source of Truth**: `CartConfiguration` drives both UI and pricing
5. **Separation of Concerns**: Business logic in packages, UI in apps

## System Components

### 1. Type System (`packages/types`)

Defines the core domain model:

- **CartConfiguration**: Complete state of a customized cart
- **ConfigOption**: Available options with pricing and constraints
- **Material**: Material definitions with zones and finishes
- **PricingBreakdown**: Itemized cost calculation result
- **Platform**: Base cart platform definition

All types are exported from a single index file for easy importing.

### 2. Configuration Management (`packages/config`)

Utilities for creating and manipulating configurations:

- `createConfiguration()` - Initialize new configuration
- `addOption()` / `removeOption()` - Modify selected options
- `setMaterialSelection()` - Apply material to a zone
- `serialize()` / `deserialize()` - JSON conversion with Date handling

All functions are **immutable** - they return new configuration objects.

### 3. Rules Engine (`packages/rules`)

Validates configuration constraints:

- **Requires**: Options that must be selected first (dependencies)
- **Excludes**: Options that cannot coexist (conflicts)

Functions:
- `validateOptionAddition()` - Check if an option can be added
- `validateOptionRemoval()` - Check if removal breaks dependencies
- `validateConfiguration()` - Full configuration consistency check
- `getAvailableOptions()` - Filter to only valid options

### 4. Pricing Engine (`packages/pricing`)

Pure pricing calculation:

- `calculatePricing()` - Main pricing function
- Separates parts cost, labor cost, and material cost
- Returns itemized breakdown with line items per option
- `LABOR_RATE_PER_HOUR` constant ($125/hour)

### 5. Backend API (`apps/api`)

Express server with three route groups:

**Catalog Routes** (`/api/catalog`)
- `GET /platform` - Base platform definition
- `GET /options` - All available options
- `GET /materials` - All available materials

**Configuration Routes** (`/api/configurations`)
- `POST /` - Save/update a configuration
- `GET /:id` - Load a configuration by ID

**Quote Routes** (`/api/quotes`)
- `POST /` - Submit a quote request
- `GET /` - List all quotes (admin)
- `GET /:id` - Get specific quote
- `PATCH /:id/status` - Update quote status

**Database**: SQLite via Prisma ORM
- `Configuration` table (JSON fields for options/materials)
- `Quote` table (linked to configuration)

### 6. Frontend Web App (`apps/web`)

React application built with Vite:

**State Management**: Zustand store (`store/configurator.ts`)
- Loads catalog from API
- Manages current configuration
- Recalculates pricing on changes
- Validates rules before mutations

**Pages**:
- `ConfiguratorPage` - Main 3D configurator with option/material panels
- `QuotePage` - Quote request form with pricing summary
- `AdminQuotesPage` - Admin view of submitted quotes

**Components**:
- `CartScene` - Three.js/React Three Fiber 3D scene (currently primitives)
- `OptionSelector` - Option list grouped by category
- `MaterialSelector` - Material swatches grouped by zone
- `PricingSummary` - Itemized pricing display

**3D Scene Architecture**:
- Uses placeholder primitives (boxes, cylinders, spheres)
- Responds to configuration changes
- Ready for GLTF model integration via `assetPath` field
- OrbitControls for camera manipulation

## Data Model

### Configuration Flow

```
1. User selects options/materials
2. Rules engine validates constraints
3. Configuration state updates (immutable)
4. Pricing engine recalculates
5. 3D scene updates
6. UI reflects new state
```

### Option Constraints Example

```typescript
{
  id: 'suspension-lift-6',
  name: '6" Lift Kit',
  requires: ['wheels-offroad'],  // Must have off-road wheels first
  excludes: ['suspension-lift-3'] // Cannot have both lift kits
}
```

If user tries to add 6" lift without off-road wheels, the rules engine blocks it and returns validation errors.

### Material Zones

- **BODY**: Paint/vinyl for cart body
- **SEATS**: Upholstery materials
- **ROOF**: Roof finish
- **METAL**: Powdercoat for metal accents
- **GLASS**: Tint level

Each zone can have one material selected at a time.

### Pricing Calculation

```
Base Platform Price:     $8,500
+ Option Parts:          $X,XXX
+ Option Labor:          $XXX (hours × $125/hr)
+ Material Costs:        $XXX (base cost × multiplier)
─────────────────────────────────
Grand Total:            $XX,XXX
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Install all dependencies (root + workspaces)
npm install

# Build all packages
npm run build:packages

# Generate Prisma client
cd apps/api
npx prisma generate
npx prisma db push
```

### Running the Application

**Terminal 1 - API Server**:
```bash
npm run dev:api
# Runs on http://localhost:3001
```

**Terminal 2 - Web Frontend**:
```bash
npm run dev:web
# Runs on http://localhost:3000
```

### Accessing the Application

- **Configurator**: http://localhost:3000
- **Quote Form**: http://localhost:3000/quote
- **Admin Quotes**: http://localhost:3000/admin/quotes
- **API Health**: http://localhost:3001/health

## Seed Data

The system includes comprehensive seed data in `apps/api/src/data/seed.ts`:

- **1 Platform**: Standard Golf Cart ($8,500)
- **22 Options**: Across 8 categories (seating, roof, wheels, lighting, etc.)
- **15 Materials**: Body paints, seat fabrics, roof finishes, metal coatings, glass tints

Example options with constraints:
- Standard/Captain/Premium seats (mutually exclusive)
- 3"/6" lift kits (6" requires off-road wheels)
- Basic/Premium audio (mutually exclusive)

## Development Workflow

### Adding a New Option

1. Add to `OPTIONS` array in `apps/api/src/data/seed.ts`
2. Set `requires` and `excludes` constraints
3. Frontend automatically picks it up via API
4. Rules engine enforces constraints
5. Pricing engine includes it in calculations

### Adding a New Material

1. Add to `MATERIALS` array in `apps/api/src/data/seed.ts`
2. Set correct `MaterialZone`
3. Set `priceMultiplier` for pricing
4. Frontend shows it in material selector

### Extending the Type System

1. Add types to `packages/types/src/index.ts`
2. Export from index
3. Rebuild: `npm run build --workspace=packages/types`
4. Other packages auto-import updated types

## Testing the Flow

1. **Start both servers** (API and Web)
2. **Open configurator** at http://localhost:3000
3. **Add options** - Try adding 6" lift without off-road wheels (will fail)
4. **Add off-road wheels** first, then 6" lift (will succeed)
5. **Select materials** - Choose paint, seats, roof, etc.
6. **View pricing** - Right panel shows itemized breakdown
7. **Request quote** - Fills form, submits to database
8. **Check admin panel** - View submitted quotes

## Project Structure Details

```
cart-configurator/
├── package.json              # Root workspace config
├── tsconfig.base.json        # Shared TypeScript config
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── src/
│   │       ├── index.ts      # Express server
│   │       ├── routes/       # API endpoints
│   │       └── data/
│   │           └── seed.ts   # Catalog data
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx      # App entry point
│           ├── store/        # Zustand state
│           ├── components/   # React components
│           ├── pages/        # Route pages
│           ├── api/          # API client
│           └── hooks/        # Custom hooks
└── packages/
    ├── types/
    │   └── src/
    │       └── index.ts      # Core types
    ├── config/
    │   └── src/
    │       └── index.ts      # Config utilities
    ├── pricing/
    │   └── src/
    │       └── index.ts      # Pricing engine
    └── rules/
        └── src/
            └── index.ts      # Rules engine
```

## Future Expansion

This scaffold is designed for extension:

### Multiple Platforms
- Add new platforms to seed data
- Each platform can have different options
- Configuration stores `platformId`

### 3D Model Integration
- Replace primitives with GLTF models
- Use `assetPath` from option definitions
- Load models dynamically based on configuration

### Advanced Features
- Animation system for suspension/doors
- Custom fabrication estimator
- Material texture preview
- Configuration sharing (URL-based)
- User accounts and saved configs
- Payment processing integration

### Admin Features
- CMS for managing options/materials
- Quote workflow management
- Build queue tracking
- Inventory management

## Notes

- **No authentication**: This is a scaffold - add auth before production
- **No payment**: Quote-based system only
- **Placeholder 3D**: Using primitives until real models are ready
- **SQLite**: Switch to PostgreSQL for production
- **No caching**: Add Redis for production API
- **No file uploads**: Future feature for custom graphics

## TypeScript Configuration

All packages use strict mode:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true
}
```

No `any` types are used anywhere in the codebase.

## Build Commands

```bash
# Build everything
npm run build

# Build just packages
npm run build:packages

# Build just web
npm run build:web

# Build just api
npm run build:api

# Development mode (watch)
npm run dev:web    # Frontend with HMR
npm run dev:api    # Backend with tsx watch
```

## License

This is a scaffold project for internal use.
