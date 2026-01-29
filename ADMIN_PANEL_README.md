# Admin Panel - Golf Cart Configurator

Production-ready admin panel for managing golf cart configuration options, materials, and business rules.

## 🎯 Overview

The admin panel provides a web-based interface for Sales, Engineering, and Production teams to manage the configurator catalog without code changes. All data is stored in the database and immediately available to end users.

## ✨ Features

### Authentication & Authorization
- **JWT-based authentication** with 15-minute access tokens and 7-day refresh tokens
- **Role-based access control** with 6 permission levels:
  - `SUPER_ADMIN` - Full system access
  - `ADMIN` - Manage all catalog data
  - `SALES` - Edit pricing and descriptions
  - `ENGINEERING` - Edit specifications and rules
  - `PRODUCTION` - Edit labor hours
  - `VIEWER` - Read-only access
- **Audit logging** - All changes tracked with user, timestamp, and IP

### Platform Management
- Create and edit golf cart platforms (e.g., Standard 4-Seater, Luxury 6-Seater)
- Set base pricing
- Define default 3D asset paths
- Soft delete with recovery option

### Option Management
- Add configuration options per platform
- Organize by category (ROOF, SEATS, WHEELS, etc.)
- Set part pricing and labor hours
- Link 3D assets
- Build compatibility rules (REQUIRES/EXCLUDES)

### Material Management
- Define materials by zone (BODY, SEATS, ROOF, TRIM, GLASS)
- Set material type (PAINT, POWDER_COAT, VINYL, etc.)
- Pick colors with visual hex picker
- Configure finish (GLOSS, SATIN, MATTE, METALLIC)
- Set price multipliers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- SQLite (included with Prisma)

### Installation

Already installed as part of monorepo. To seed the admin user:

```bash
cd apps/api
npm run seed:admin
```

This creates:
- Email: `admin@golfcarts.com`
- Password: `admin123`
- Role: `SUPER_ADMIN`

⚠️ **Change the default password immediately in production!**

### Running

Start both API and web servers:

```bash
# Terminal 1 - API Server
cd apps/api
npm start

# Terminal 2 - Web Server
cd apps/web
npm run dev
```

Then visit: **http://localhost:5173/admin/login**

## 📚 Usage

### Logging In

1. Navigate to `/admin/login`
2. Enter credentials (default: admin@golfcarts.com / admin123)
3. Click "Sign In"
4. You'll be redirected to the dashboard

### Creating a Platform

1. Go to **Platforms** from the sidebar
2. Click **+ Create Platform**
3. Fill in:
   - **Platform ID**: Machine-readable identifier (e.g., `standard-4seat`)
   - **Name**: Display name (e.g., "Standard 4-Seater")
   - **Description**: Customer-facing description
   - **Base Price**: Starting price without options
   - **Asset Path** (optional): Path to 3D model file
4. Click **Create Platform**

### Adding Options

1. Go to **Options** from the sidebar
2. Click **+ Create Option**
3. Fill in:
   - **Option ID**: Machine-readable identifier (e.g., `roof-extended`)
   - **Platform**: Which platform this option belongs to
   - **Name**: Display name (e.g., "Extended Roof")
   - **Category**: Type of option (ROOF, SEATS, etc.)
   - **Description**: What the customer sees
   - **Part Price**: Cost of parts
   - **Labor Hours**: Installation time
   - **Asset Path** (optional): Path to 3D model
4. Click **Create Option**

### Creating Materials

1. Go to **Materials** from the sidebar
2. Click **+ Create Material**
3. Fill in:
   - **Material ID**: Machine-readable identifier (e.g., `paint-red-gloss`)
   - **Name**: Display name (e.g., "Gloss Red Paint")
   - **Zone**: Where it's applied (BODY, SEATS, ROOF, etc.)
   - **Type**: Material category (PAINT, VINYL, etc.)
   - **Description**: Details about the finish
   - **Color**: Use color picker or enter hex code
   - **Finish**: Surface finish (GLOSS, MATTE, etc.)
   - **Price Multiplier**: 1.0 = base price, 1.5 = 50% premium
4. Click **Create Material**

### Adding Option Rules

*(Coming in Phase 4)*

Rules enforce compatibility constraints like:
- "Extended roof REQUIRES premium seats"
- "Chrome wheels EXCLUDES powder-coated frame"

## 🔒 Security

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWTs signed with HMAC-SHA256
- Tokens stored in localStorage (httpOnly cookies recommended for production)
- Automatic token refresh before expiration

### Authorization
- Every endpoint protected with authentication middleware
- Role-based permissions enforced at route level
- Field-level permissions for partial updates
- Soft deletes prevent accidental data loss

### Production Recommendations
1. **Move JWT secrets to environment variables**
   ```bash
   JWT_ACCESS_SECRET=your-random-secret-here
   JWT_REFRESH_SECRET=your-other-random-secret
   ```

2. **Use HTTPS in production** - Tokens sent over TLS only

3. **Enable CORS whitelist** - Restrict API access to known origins

4. **Add rate limiting** - Prevent brute force attacks

5. **Use httpOnly cookies** - Better XSS protection than localStorage

## 🗄️ Database Schema

### User
- Authentication and profile data
- Role assignment
- Active/inactive flag

### Platform
- Base cart configurations
- Pricing
- Asset references

### Option
- Configuration options per platform
- Part pricing and labor hours
- Asset references

### OptionRelation
- Compatibility rules (REQUIRES/EXCLUDES)
- Reason for rule

### Material
- Material definitions by zone
- Color and finish specs
- Price multipliers

### AuditLog
- Complete change history
- User attribution
- IP tracking

## 📖 API Documentation

### Authentication Endpoints

**POST /api/admin/auth/login**
```json
{
  "email": "admin@golfcarts.com",
  "password": "admin123"
}
```

Returns: `{ accessToken, refreshToken, user }`

**POST /api/admin/auth/logout**
Invalidates refresh token (requires auth).

**GET /api/admin/auth/me**
Returns current user info (requires auth).

**POST /api/admin/auth/refresh**
```json
{
  "refreshToken": "..."
}
```

Returns new access token.

### Platform Endpoints

All require authentication with appropriate permissions.

- `GET /api/admin/platforms` - List all platforms
- `GET /api/admin/platforms/:id` - Get single platform
- `POST /api/admin/platforms` - Create platform (Admin+)
- `PUT /api/admin/platforms/:id` - Update platform (Admin+)
- `DELETE /api/admin/platforms/:id` - Soft delete (Super Admin)

### Option Endpoints

- `GET /api/admin/options` - List all options (filters: platformId, category)
- `GET /api/admin/options/:id` - Get single option with rules
- `POST /api/admin/options` - Create option (Admin+)
- `PUT /api/admin/options/:id` - Update option (role-based fields)
- `DELETE /api/admin/options/:id` - Soft delete (Admin+)
- `POST /api/admin/options/:id/rules` - Add compatibility rule (Engineering+)
- `DELETE /api/admin/options/:id/rules/:ruleId` - Delete rule (Engineering+)

### Material Endpoints

- `GET /api/admin/materials` - List all materials (filters: zone, type)
- `GET /api/admin/materials/:id` - Get single material
- `POST /api/admin/materials` - Create material (Admin/Sales)
- `PUT /api/admin/materials/:id` - Update material (Admin/Sales)
- `DELETE /api/admin/materials/:id` - Soft delete (Admin+)

## 🧪 Testing

### Run API Tests
```bash
cd apps/api
./test-admin-api.sh
```

This script tests:
- Authentication
- Platform CRUD
- Option CRUD
- Material CRUD
- Option rules

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Logout clears session
- [ ] Create platform
- [ ] Edit platform
- [ ] Delete platform
- [ ] Create option for platform
- [ ] Edit option
- [ ] Delete option
- [ ] Create material with color picker
- [ ] Edit material color
- [ ] Delete material
- [ ] View audit logs in database
- [ ] Token refresh on expiration

## 🐛 Troubleshooting

### Login Returns "Invalid credentials"
- Check that admin user was seeded: `npm run seed:admin`
- Verify database exists at `apps/api/prisma/dev.db`
- Check API server is running on port 3001

### "Network error" on Login
- Ensure API server is running
- Check CORS settings in `apps/api/src/index.ts`
- Verify frontend is using correct API_URL (default: http://localhost:3001)

### TypeScript Build Errors
- Run `npm install` in both apps/api and apps/web
- Clear node_modules and reinstall if issues persist
- Check TypeScript version (should be 5.x)

### Database Locked Errors
- Only one Prisma Studio instance can be open at a time
- Close any running `npx prisma studio` processes
- Restart API server

## 📁 File Structure

```
apps/
├── api/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── authUtils.ts       # JWT, hashing, permissions
│   │   │   └── authMiddleware.ts  # Express auth middleware
│   │   ├── routes/
│   │   │   └── admin/
│   │   │       ├── auth.ts        # Login/logout
│   │   │       ├── platforms.ts   # Platform CRUD
│   │   │       ├── options.ts     # Option CRUD
│   │   │       └── materials.ts   # Material CRUD
│   │   └── data/
│   │       └── seedAdmin.ts       # Admin user seed
│   └── prisma/
│       └── schema.prisma          # Database schema
└── web/
    └── src/
        └── admin/
            ├── api/
            │   └── client.ts      # API client
            ├── store/
            │   └── authStore.ts   # Zustand auth state
            ├── components/
            │   ├── AdminLayout.tsx      # Sidebar layout
            │   └── ProtectedRoute.tsx   # Auth guard
            └── pages/
                ├── AdminLogin.tsx       # Login form
                ├── AdminDashboard.tsx   # Dashboard
                ├── PlatformsPage.tsx    # Platform management
                ├── OptionsPage.tsx      # Option management
                └── MaterialsPage.tsx    # Material management
```

## 🎨 UI Design

The admin panel uses a minimal, functional design:

- **Clean typography** - System fonts for fast load
- **Subtle colors** - Blue primary, red for destructive actions
- **Grid layouts** - Responsive cards and forms
- **Inline forms** - Create/edit without page navigation
- **Visual feedback** - Loading states, error messages, confirmations

No external CSS frameworks to keep bundle small.

## 🔮 Future Enhancements

### Phase 4 Features
- Visual rule builder for option constraints
- Drag-and-drop rule ordering
- Conflict detection and warnings
- Audit log viewer with filtering
- User management UI
- Role assignment interface
- Bulk import/export tools

### Performance Optimizations
- Code splitting with React.lazy()
- Image optimization for material previews
- Virtual scrolling for large lists
- Debounced search and filtering

### UX Improvements
- Keyboard shortcuts
- Dark mode
- Undo/redo for edits
- Inline validation
- Autosave drafts

## 📞 Support

For issues or questions:
1. Check this README
2. Review ADMIN_PANEL_ARCHITECTURE.md
3. Check audit logs for recent changes
4. Contact your development team

## 📄 License

Part of the Golf Cart Configurator project. Internal use only.
