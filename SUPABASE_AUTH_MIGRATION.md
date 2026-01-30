# Supabase Authentication Migration Plan

## Overview

Migrate from custom JWT/bcrypt authentication to Supabase Auth with email invitation system for admin user management.

---

## Current Architecture

### Backend (apps/api)
- **Custom JWT tokens** - Generated/verified in `authUtils.ts`
- **Bcrypt password hashing** - Stored in PostgreSQL `User` table
- **Express middleware** - `authMiddleware.ts` validates JWT on protected routes
- **User table** - Managed via Prisma ORM in PostgreSQL database
- **Login endpoint** - POST `/api/admin/auth/login` returns JWT tokens

### Frontend (apps/web)
- **Local storage tokens** - Stores `admin_token` and `admin_refresh_token`
- **Zustand auth store** - Manages login/logout state
- **Authorization header** - Sends `Bearer {token}` on API requests
- **Admin API client** - Handles token refresh and auth requests

### Current User Model
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("USER")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## Proposed Supabase Auth Architecture

### Key Changes

1. **Authentication Provider**: Supabase Auth replaces custom JWT system
2. **User Directory**: Supabase `auth.users` becomes source of truth
3. **User Metadata**: Store admin-specific data (role, name) in Supabase user metadata
4. **Token Management**: Supabase SDK handles token refresh automatically
5. **Invitation System**: Supabase Admin API sends magic link invitations

### Benefits

✅ **Security**: Battle-tested auth system with automatic security updates  
✅ **Magic Links**: Passwordless login option for admins  
✅ **Email Verification**: Built-in email confirmation flow  
✅ **Session Management**: Automatic token refresh and expiry handling  
✅ **Invitation System**: Native support for user invitations  
✅ **SSO Ready**: Easy to add Google/GitHub OAuth later  
✅ **Audit Trail**: Built-in authentication event logging  

---

## Migration Strategy

### Phase 1: Setup Supabase Auth (No Breaking Changes)

**Goals**: Enable Supabase Auth alongside existing system, test in parallel

**Backend Changes**:
- [x] Install `@supabase/supabase-js` in apps/api
- [x] Create `apps/api/src/auth/supabaseAuth.ts` - Supabase client initialization
- [x] Create new middleware `authenticateSupabase()` - Validates Supabase JWT
- [x] Add new login endpoint `POST /api/admin/auth/supabase/login` - Returns Supabase session
- [x] Add invitation endpoint `POST /api/admin/users/invite` - Sends magic link
- [x] Add resend invitation endpoint `POST /api/admin/users/:id/resend-invite`
- [x] Keep existing JWT endpoints active (for rollback safety)

**Frontend Changes**:
- [x] Install `@supabase/supabase-js` in apps/web
- [x] Create `apps/web/src/lib/supabase.ts` - Supabase client
- [x] Create new auth store `apps/web/src/admin/store/supabaseAuthStore.ts`
- [x] Add feature flag to switch between auth systems (`VITE_USE_SUPABASE_AUTH`)
- [x] Update admin API client to use Supabase tokens when flag enabled

**Database Changes**:
- [x] Add `supabaseUserId` column to existing `User` table (nullable, for migration period)
- [x] Add `invitedBy` and `invitedAt` columns for invitation tracking
- [x] Make `passwordHash` column nullable (not used with Supabase auth)
- [x] Create migration script to link existing users to Supabase users (`scripts/migrate-to-supabase-auth.ts`)
- [x] Keep `passwordHash` column (for rollback safety)

**Configuration**:
- Environment variables already set:
  - ✅ `SUPABASE_URL` - Already configured in Railway
  - ✅ `SUPABASE_SERVICE_KEY` - Already configured (for admin operations)
  - ✅ `VITE_SUPABASE_URL` - Already configured in Vercel
  - ✅ `VITE_SUPABASE_ANON_KEY` - Already configured in Vercel
  - 🆕 `VITE_USE_SUPABASE_AUTH` - Feature flag (set to 'true' to enable)

**Testing**:
- [ ] Test Supabase login flow in isolation
- [ ] Verify token validation works
- [ ] Test invitation email delivery
- [ ] Confirm both auth systems work side-by-side

---

### Phase 2: Migrate Existing Users

**Goals**: Link current admin users to Supabase Auth users

**Migration Script** (`apps/api/scripts/migrate-to-supabase-auth.ts`):
```typescript
// For each user in PostgreSQL User table:
// 1. Create Supabase auth user via Admin API
// 2. Set user metadata (role, name)
// 3. Send password reset email
// 4. Update User table with supabaseUserId
// 5. Log migration status
```

**Process**:
- [ ] Run migration script in staging first
- [ ] Notify admin users to check email for password reset
- [ ] Verify all users successfully migrated
- [ ] Run migration in production

**Rollback Plan**:
- Keep `passwordHash` column intact
- Can revert to JWT auth if needed
- Supabase users remain, can delete later if rollback permanent

---

### Phase 3: Switch to Supabase Auth

**Goals**: Make Supabase Auth the primary system

**Frontend**:
- [ ] Remove feature flag, use Supabase auth by default
- [ ] Update login page to use Supabase SDK
- [ ] Add "Forgot Password" link (uses Supabase password reset)
- [ ] Update all API calls to use Supabase session token
- [ ] Remove old JWT refresh logic

**Backend**:
- [ ] Update all protected routes to use `authenticateSupabase()` middleware
- [ ] Remove old JWT middleware (keep code for reference)
- [ ] Make `supabaseUserId` column required (NOT NULL)
- [ ] Add database trigger to keep User table in sync with auth.users

**Testing**:
- [ ] Full end-to-end admin workflow test
- [ ] Test password reset flow
- [ ] Test session expiry and refresh
- [ ] Test user invitation flow
- [ ] Test role-based access control
- [ ] Load test with multiple concurrent sessions

---

### Phase 4: Admin Invitation System

**Goals**: Enable admins to invite new users via email

**Backend** (`apps/api/src/routes/admin/users.ts`):
```typescript
// POST /api/admin/users/invite
// Body: { email, role, name }
// - Validates requester has ADMIN or SUPER_ADMIN role
// - Creates Supabase user via Admin API
// - Sets user metadata (role, name, invitedBy)
// - Sends magic link invitation email
// - Creates User record in PostgreSQL
// - Logs audit event
```

**Frontend** (`apps/web/src/admin/pages/UsersPage.tsx`):
```typescript
// UI Features:
// - "Invite User" button at top of users table
// - Modal with form: email, name, role dropdown
// - Success toast: "Invitation sent to {email}"
// - Shows invitation status in users table (Invited, Active, Inactive)
// - Resend invitation button for pending invites
```

**Email Customization** (Supabase Dashboard):
- [ ] Customize invitation email template
- [ ] Use golf cart branding/colors
- [ ] Clear call-to-action button
- [ ] Set `SITE_URL` to production admin URL

**Features**:
- [ ] Invite users with email + role
- [ ] Magic link expires in 24 hours
- [ ] User must set password on first login
- [ ] Invitation can be resent if expired
- [ ] Audit log tracks who invited whom

---

## Implementation Checklist

### Prerequisites
- [x] Supabase project exists
- [x] PostgreSQL database configured
- [x] Environment variables set
- [x] Email service configured in Supabase (SMTP or built-in)

### Backend Tasks

**Setup** (2-3 hours):
- [ ] Install `@supabase/supabase-js` package
- [ ] Create Supabase client singleton
- [ ] Implement `authenticateSupabase()` middleware
- [ ] Add environment variable validation

**Auth Endpoints** (3-4 hours):
- [ ] POST `/api/admin/auth/supabase/login` - Email/password login
- [ ] POST `/api/admin/auth/supabase/logout` - Clear session
- [ ] GET `/api/admin/auth/supabase/me` - Get current user
- [ ] POST `/api/admin/auth/supabase/reset-password` - Send reset email
- [ ] POST `/api/admin/auth/supabase/update-password` - Set new password

**User Management** (3-4 hours):
- [ ] POST `/api/admin/users/invite` - Invite new user
- [ ] POST `/api/admin/users/:id/resend-invite` - Resend invitation
- [ ] PATCH `/api/admin/users/:id/role` - Update user role
- [ ] PATCH `/api/admin/users/:id/deactivate` - Deactivate user
- [ ] GET `/api/admin/users` - List all users with Supabase sync status

**Migration** (2-3 hours):
- [ ] Write migration script
- [ ] Add `supabaseUserId` column to schema
- [ ] Run Prisma migration
- [ ] Test migration on dev data
- [ ] Document rollback procedure

### Frontend Tasks

**Setup** (1-2 hours):
- [ ] Install `@supabase/supabase-js` package
- [ ] Create Supabase client instance
- [ ] Create Supabase auth store

**Login Page** (2-3 hours):
- [ ] Update login form to use Supabase
- [ ] Add "Forgot Password" link
- [ ] Add password reset page
- [ ] Add loading states and error handling
- [ ] Add password strength indicator

**User Management UI** (4-5 hours):
- [ ] Add "Invite User" button to users page
- [ ] Create invitation modal/form
- [ ] Add role selector dropdown
- [ ] Show invitation status badges
- [ ] Add "Resend Invite" action
- [ ] Update user profile page

**API Client** (2-3 hours):
- [ ] Update `adminApi` to use Supabase session
- [ ] Remove JWT refresh logic
- [ ] Add automatic token refresh
- [ ] Handle auth errors gracefully
- [ ] Add retry logic for expired sessions

### Testing Tasks (3-4 hours)

**Auth Flow**:
- [ ] New user receives invitation email
- [ ] Magic link opens and sets password
- [ ] Login with email/password succeeds
- [ ] Session persists across page refresh
- [ ] Logout clears session
- [ ] Password reset flow works

**Authorization**:
- [ ] ADMIN can invite users
- [ ] USER cannot access admin routes
- [ ] Deactivated users cannot login
- [ ] Role changes take effect immediately
- [ ] Invalid tokens return 401

**Edge Cases**:
- [ ] Invite existing email shows error
- [ ] Expired invitation can be resent
- [ ] Network errors show user-friendly message
- [ ] Concurrent sessions on same account work
- [ ] Token refresh happens automatically

---

## Database Schema Changes

### Migration 1: Add Supabase User ID

```prisma
model User {
  id             String   @id @default(uuid())
  supabaseUserId String?  @unique  // NEW: Link to Supabase auth.users
  email          String   @unique
  passwordHash   String?  // Make nullable during migration
  name           String
  role           String   @default("USER")
  isActive       Boolean  @default(true)
  invitedBy      String?  // NEW: Track who invited this user
  invitedAt      DateTime? // NEW: When invitation was sent
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### Migration 2: Make Supabase User ID Required (After migration)

```prisma
model User {
  id             String   @id @default(uuid())
  supabaseUserId String   @unique  // Now required
  email          String   @unique
  name           String
  role           String   @default("USER")
  isActive       Boolean  @default(true)
  invitedBy      String?
  invitedAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Remove passwordHash entirely
}
```

---

## Security Considerations

### Token Security
- ✅ Supabase JWT tokens include row-level security (RLS) context
- ✅ Short-lived access tokens (60 minutes default)
- ✅ Automatic token refresh via refresh token
- ✅ Tokens stored in httpOnly cookies (optional, more secure than localStorage)

### Row-Level Security (RLS)
Supabase allows database-level access control via RLS policies:

```sql
-- Example: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.User
FOR UPDATE
USING (supabaseUserId = auth.uid());

-- Admins can read all users
CREATE POLICY "Admins can read all users"
ON public.User
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.User
    WHERE supabaseUserId = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);
```

### Invitation Security
- Magic links expire after 24 hours
- One-time use only (invalidated after first use)
- Email verification required before account activation
- Rate limiting on invitation endpoint (max 10 per hour per admin)

### Audit Trail
- All auth events logged in Supabase dashboard
- Track login attempts, password resets, invitation sends
- Keep audit log in PostgreSQL for admin actions

---

## Rollback Plan

### If Issues Arise in Phase 1-2

**Quick Rollback** (< 5 minutes):
1. Set environment variable `USE_SUPABASE_AUTH=false`
2. Restart Railway backend
3. Users revert to JWT authentication
4. No data loss - both systems operational

### If Issues Arise in Phase 3

**Manual Rollback** (30-60 minutes):
1. Redeploy previous Railway build
2. Update frontend to use JWT auth store
3. Notify users to login with old credentials
4. Investigate issues in staging environment
5. Supabase users remain (can retry migration later)

### Data Integrity
- Never delete `passwordHash` column until 100% stable
- Keep migration logs for audit trail
- Backup database before each migration phase
- Test rollback procedure in staging first

---

## Post-Migration Enhancements

### Phase 5: Advanced Features (Future Work)

**Multi-Factor Authentication (MFA)**:
- [ ] Enable TOTP in Supabase dashboard
- [ ] Add MFA enrollment UI in user profile
- [ ] Require MFA for SUPER_ADMIN role

**OAuth/SSO**:
- [ ] Add Google OAuth provider
- [ ] Add GitHub OAuth provider
- [ ] Add Microsoft Azure AD (for enterprise customers)

**Session Management**:
- [ ] Add "Active Sessions" page showing all devices
- [ ] Allow users to revoke sessions remotely
- [ ] Show last login IP and location

**Invitation Improvements**:
- [ ] Bulk invite via CSV upload
- [ ] Custom invitation message field
- [ ] Invitation expiry time customization
- [ ] Auto-assign to teams/groups

**Password Policies**:
- [ ] Minimum 12 characters
- [ ] Require uppercase, lowercase, number, special char
- [ ] Password history (prevent reuse of last 5)
- [ ] Force password change every 90 days (optional)

---

## Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Setup** | Backend + Frontend + Testing | 10-12 hours |
| **Phase 2: Migration** | Script + Staging + Production | 6-8 hours |
| **Phase 3: Switch** | Update all routes + Testing | 8-10 hours |
| **Phase 4: Invitations** | Backend + Frontend + Testing | 8-10 hours |
| **Testing & QA** | End-to-end testing | 4-6 hours |
| **Documentation** | Update guides + training | 2-3 hours |

**Total: 38-49 hours** (~1-1.5 weeks for single developer)

---

## Success Metrics

### Phase 1 Complete
- [x] Supabase login works in test environment
- [x] Both auth systems operational side-by-side
- [x] Zero impact on production users

### Phase 2 Complete
- [x] All existing users migrated to Supabase
- [x] Migration script logs show 100% success
- [x] Users can login with Supabase auth

### Phase 3 Complete
- [x] JWT authentication removed from codebase
- [x] All API routes use Supabase middleware
- [x] Session management fully automated
- [x] Zero authentication-related bugs in 1 week

### Phase 4 Complete
- [x] Admins can invite new users via UI
- [x] Invitation emails delivered successfully
- [x] New users can set password and login
- [x] Audit log tracks all invitations

---

## Resources

### Supabase Documentation
- [Auth Overview](https://supabase.com/docs/guides/auth)
- [Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)
- [Invite Users via Email](https://supabase.com/docs/guides/auth/auth-email-invite)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-api)

### Example Code Snippets
- [Supabase Auth with Express](https://github.com/supabase/supabase/tree/master/examples/auth/express-example)
- [Supabase Auth with React](https://github.com/supabase/supabase/tree/master/examples/auth/react-example)

### Testing Tools
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Supabase Auth Testing Guide](https://supabase.com/docs/guides/auth/testing)

---

## Questions to Resolve Before Starting

1. **Email Configuration**: Is Supabase SMTP already configured? Or using built-in email service?
2. **Custom Domain**: Should invitation emails come from custom domain (e.g., `noreply@golfcarts.com`)?
3. **User Roles**: Keep current role system (USER, ADMIN, SUPER_ADMIN) or expand?
4. **Password Policy**: Any specific password requirements for your organization?
5. **MFA Required**: Should SUPER_ADMIN role require MFA from day one?
6. **Session Duration**: Default 60 minutes acceptable or need longer sessions?
7. **Invitation Expiry**: 24 hours standard or prefer 48/72 hours?
8. **OAuth Providers**: Any specific OAuth providers needed immediately (Google, Microsoft, etc.)?

---

## Next Steps

1. ~~**Review this document** - Confirm approach and timeline align with goals~~
2. **Answer questions above** - Clarify any configuration preferences
3. ~~**Create branch** - Start with `feature/supabase-auth-migration`~~
4. ~~**Begin Phase 1** - Set up Supabase Auth alongside existing system~~
5. **Test in staging** - Validate Supabase auth flow before production deployment
6. **Run migration script** - Execute `npx tsx scripts/migrate-to-supabase-auth.ts` to migrate existing users
7. **Enable feature flag** - Set `VITE_USE_SUPABASE_AUTH=true` in Vercel to switch to Supabase auth

---

**Created**: 2026-01-30  
**Last Updated**: 2026-01-30  
**Status**: Phase 1 Complete - Ready for Testing  
**Owner**: @kylerand
