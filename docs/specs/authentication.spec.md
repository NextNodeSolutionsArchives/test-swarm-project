# Authentication — Spec

## Overview

Email/password authentication system for the Pulseo landing page. Users can register with a username, email, and password, then log in to see authenticated state in the navbar (avatar, username, dropdown). Built as a Hono API integrated into Astro via SSR, with SQLite storage, argon2 password hashing, and JWT + refresh token session management.

## Context

The Pulseo landing page (astro-landing-page spec) currently has no authentication. The "Go to Dashboard" CTA links to `/dashboard` which doesn't exist. This feature adds user registration and login so authenticated users see their identity in the navbar. No dashboard page is built — the focus is on the auth system itself and the navbar integration.

## Functional Requirements

### FR-1: Astro SSR Configuration

- Switch Astro from static (SSG) to hybrid or SSR mode using the Node adapter (`@astrojs/node`)
- Configure `astro.config.mjs` to use the Node adapter with `output: "hybrid"` (static pages by default, SSR opt-in for auth pages and API routes)
- Ensure existing static landing page remains fully static (no regression)

### FR-2: Hono API Integration

- Mount a Hono app at `/api/*` inside Astro using an API route catch-all
- The Hono app handles all auth endpoints under `/api/auth/*`
- Hono middleware stack: CORS (same-origin), JSON body parsing, cookie parsing
- All API responses use JSON format with consistent shape:
  ```
  Success: { success: true, data: { ... } }
  Error:   { success: false, error: { code: string, message: string } }
  ```

### FR-3: Database Setup (SQLite + better-sqlite3)

- SQLite database file at `data/pulseo.db` (gitignored)
- Schema migration runs on first API request (or server start) — create tables if they don't exist
- **Users table**:
  | Column       | Type    | Constraints                    |
  |-------------|---------|-------------------------------|
  | id          | TEXT    | PRIMARY KEY (UUID v4)         |
  | username    | TEXT    | UNIQUE, NOT NULL, 3-30 chars  |
  | email       | TEXT    | UNIQUE, NOT NULL              |
  | password    | TEXT    | NOT NULL (argon2 hash)        |
  | created_at  | TEXT    | ISO 8601 timestamp            |
  | updated_at  | TEXT    | ISO 8601 timestamp            |

- **Refresh tokens table**:
  | Column       | Type    | Constraints                    |
  |-------------|---------|-------------------------------|
  | id          | TEXT    | PRIMARY KEY (UUID v4)         |
  | user_id     | TEXT    | FOREIGN KEY → users.id        |
  | token_hash  | TEXT    | NOT NULL (SHA-256 hash)       |
  | expires_at  | TEXT    | ISO 8601 timestamp            |
  | created_at  | TEXT    | ISO 8601 timestamp            |

### FR-4: User Registration

- **Endpoint**: `POST /api/auth/register`
- **Request body**:
  ```json
  {
    "username": "string (3-30 chars, alphanumeric + underscores)",
    "email": "string (valid email format)",
    "password": "string (12+ chars, see rules below)"
  }
  ```
- **Password rules**: minimum 12 characters, at least one uppercase letter, one lowercase letter, one number, one special character (`!@#$%^&*()_+-=[]{}|;:,.<>?`)
- **Validation**:
  - Username: 3-30 characters, alphanumeric and underscores only, case-insensitive uniqueness check
  - Email: valid format, case-insensitive uniqueness check (stored lowercase)
  - Password: enforce all rules above
- **On success**:
  - Hash password with argon2
  - Insert user into database
  - Generate access token (JWT) and refresh token
  - Set both tokens as httpOnly secure cookies
  - Return `{ success: true, data: { user: { id, username, email } } }`
- **Error codes**:
  - `USERNAME_TAKEN`: username already exists
  - `EMAIL_TAKEN`: email already registered
  - `INVALID_USERNAME`: format violation
  - `INVALID_EMAIL`: format violation
  - `WEAK_PASSWORD`: doesn't meet complexity rules (include which rules failed)
  - `VALIDATION_ERROR`: generic validation failure

### FR-5: User Login

- **Endpoint**: `POST /api/auth/login`
- **Request body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **On success**:
  - Verify password against stored argon2 hash
  - Generate new access token and refresh token
  - Store refresh token hash in database
  - Set both tokens as httpOnly secure cookies
  - Return `{ success: true, data: { user: { id, username, email } } }`
- **Error codes**:
  - `INVALID_CREDENTIALS`: email not found or password mismatch (same error for both — don't leak which)

### FR-6: Token Refresh

- **Endpoint**: `POST /api/auth/refresh`
- **No request body** — reads refresh token from httpOnly cookie
- **On success**:
  - Validate refresh token exists and hasn't expired
  - Look up token hash in database
  - Generate new access token and new refresh token (token rotation)
  - Invalidate old refresh token in database
  - Set new tokens as httpOnly cookies
  - Return `{ success: true, data: { user: { id, username, email } } }`
- **Error codes**:
  - `INVALID_REFRESH_TOKEN`: token missing, expired, or not in database
  - `TOKEN_REUSE_DETECTED`: if an already-invalidated refresh token is presented, revoke all tokens for that user (potential theft)

### FR-7: Logout

- **Endpoint**: `POST /api/auth/logout`
- **On success**:
  - Delete refresh token from database
  - Clear both httpOnly cookies
  - Return `{ success: true, data: null }`

### FR-8: Get Current User

- **Endpoint**: `GET /api/auth/me`
- **Authentication**: requires valid access token in cookie
- **On success**: Return `{ success: true, data: { user: { id, username, email, created_at } } }`
- **Error codes**:
  - `UNAUTHORIZED`: no token or invalid/expired token

### FR-9: Auth Page (`/auth`)

- Single page at `/auth` with two tabs: **Login** and **Register**
- **Design**: matches the Pulseo glassmorphism design system (dark background, glass card, green/orange accents)
- **Login tab**:
  - Email input field
  - Password input field
  - "Log in" submit button (green primary)
  - Link: "Don't have an account? Register" (switches to Register tab)
- **Register tab**:
  - Username input field
  - Email input field
  - Password input field with strength indicator
  - "Create account" submit button (green primary)
  - Link: "Already have an account? Log in" (switches to Login tab)
- **Shared behavior**:
  - Form validation on submit (client-side + server-side)
  - Error messages displayed inline below fields
  - Loading state on submit button (spinner or disabled state)
  - On successful login/register: redirect to `/` (landing page)
  - Tab state reflected in URL hash (`/auth#login`, `/auth#register`)
- **Implementation**: React island component for the interactive form, Astro page wrapper

### FR-10: Navbar Auth State

- Update the existing navbar (FR-13 from landing page spec) to show auth state
- **Unauthenticated state**: show "Dashboard" CTA button (existing behavior) + "Sign in" link
- **Authenticated state**:
  - Replace CTA area with: avatar circle (initials-based, gradient background) + username
  - Click avatar/username opens a dropdown menu
  - Dropdown items: "Profile" (disabled/placeholder), "Logout" button
  - Logout clears session and refreshes navbar state
- **Auth check**: on page load, call `GET /api/auth/me` to determine auth state
  - If token expired, silently attempt refresh via `POST /api/auth/refresh`
  - If refresh fails, show unauthenticated state
- **Implementation**: React island component that replaces the navbar CTA section

### FR-11: Auth Middleware

- Hono middleware that extracts and validates the JWT access token from cookies
- Attaches `user` object to the Hono context if token is valid
- Does NOT reject requests without tokens — just doesn't set `user` (routes decide if auth is required)
- Used by `GET /api/auth/me` and any future protected endpoints

## Data Model

### User Entity
```typescript
interface User {
  id: string          // UUID v4
  username: string    // 3-30 chars, alphanumeric + underscore
  email: string       // lowercase, unique
  password: string    // argon2 hash (never returned to client)
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601
}
```

### RefreshToken Entity
```typescript
interface RefreshToken {
  id: string          // UUID v4
  userId: string      // FK → User.id
  tokenHash: string   // SHA-256 hash of the actual token
  expiresAt: string   // ISO 8601
  createdAt: string   // ISO 8601
}
```

### JWT Access Token Payload
```typescript
interface AccessTokenPayload {
  sub: string         // user ID
  username: string
  email: string
  iat: number         // issued at (epoch seconds)
  exp: number         // expires at (epoch seconds)
}
```

## API Contract

| Method | Endpoint              | Auth Required | Description             |
|--------|-----------------------|---------------|-------------------------|
| POST   | /api/auth/register    | No            | Create new user         |
| POST   | /api/auth/login       | No            | Log in existing user    |
| POST   | /api/auth/refresh     | Refresh cookie| Rotate tokens           |
| POST   | /api/auth/logout      | Refresh cookie| End session             |
| GET    | /api/auth/me          | Access token  | Get current user        |

### Cookie Configuration
- **Access token cookie**: `pulseo_access`, httpOnly, secure (in production), sameSite=lax, path=/, maxAge=3600 (1 hour)
- **Refresh token cookie**: `pulseo_refresh`, httpOnly, secure (in production), sameSite=lax, path=/api/auth, maxAge=2592000 (30 days)

## UI/UX Requirements

### Auth Page Design
- Full-viewport height, centered glassmorphism card (max-width ~480px)
- Background: dark base (#0A0A0F) with subtle gradient orbs (matching landing page)
- Card: glassmorphism (`backdrop-filter: blur(20px)`, border glow)
- Tabs: two tab buttons at top of card (Login / Register), active tab has green underline
- Input fields: dark background, subtle border, focus state with green border glow
- Buttons: glassmorphism with green gradient, hover glow effect
- Password strength indicator on register: colored bar (red → orange → green) based on complexity
- Error messages: orange/red text below relevant field
- Success: brief green flash before redirect

### Navbar Dropdown Design
- Dropdown: glassmorphism card, positioned below avatar, appears on click
- Avatar: 32px circle with user initials, gradient background (green → orange)
- Dropdown items: "Profile" (grayed out), divider, "Logout" (red text on hover)
- Dropdown closes on click outside or Escape key
- Smooth GSAP fade-in/out animation for dropdown

### Responsive Behavior
- Auth page card: full-width on mobile with padding, centered on desktop
- Navbar dropdown: same behavior on all breakpoints
- Mobile hamburger menu should include "Sign in" / user avatar in mobile nav overlay

## Edge Cases

- **Concurrent registration**: two users try to register same username/email simultaneously — database UNIQUE constraint handles this, return appropriate error
- **Token refresh race condition**: multiple tabs attempt refresh simultaneously — token rotation should handle gracefully; if old token is reused after rotation, revoke all tokens for safety
- **Cookie-blocked browsers**: if cookies can't be set, auth will silently fail — show a notice if `/api/auth/me` fails unexpectedly
- **Long-inactive sessions**: refresh token expires after 30 days — user must log in again
- **Database file missing**: auto-create `data/` directory and `pulseo.db` on startup
- **Username with mixed case**: store as-is but check uniqueness case-insensitively (COLLATE NOCASE)

## Security

- **Password hashing**: argon2id with recommended parameters (memory: 65536 KB, iterations: 3, parallelism: 4)
- **JWT signing**: HS256 with a `JWT_SECRET` environment variable (error on startup if missing in production)
- **Refresh token storage**: only SHA-256 hash stored in database, never the raw token
- **Token rotation**: each refresh invalidates the old token and issues a new one
- **Reuse detection**: if an invalidated refresh token is presented, revoke ALL tokens for that user
- **httpOnly cookies**: prevents XSS from accessing tokens
- **sameSite=lax**: prevents CSRF for state-changing POST requests
- **Input sanitization**: validate and sanitize all inputs before database operations
- **No user enumeration**: login returns same error for "email not found" and "wrong password"
- **Secure in production**: cookies set with `secure: true` when `NODE_ENV=production`

## Performance

- SQLite is file-based and fast for this scale — no connection pool needed
- JWT validation is CPU-only (no DB lookup for access tokens)
- Refresh tokens require a DB lookup but this is infrequent (once per hour max)
- Database indexes on `users.email`, `users.username`, `refresh_tokens.token_hash`

## Dependencies

| Package          | Purpose                                    |
|------------------|--------------------------------------------|
| `hono`           | API framework (lightweight, fast)          |
| `@astrojs/node`  | Astro Node.js SSR adapter                  |
| `better-sqlite3` | SQLite driver for Node.js                  |
| `argon2`         | Password hashing (argon2id)                |
| `jose`           | JWT creation and verification (lightweight)|
| `uuid`           | UUID v4 generation                         |

## Out of Scope

- Dashboard page (CTA still links to `/dashboard` but no page built)
- Email verification / confirmation
- Password reset / forgot password flow
- OAuth / social login providers
- Rate limiting on auth endpoints
- User profile editing
- Account deletion
- Admin panel / user management
- Two-factor authentication (2FA)
- Session listing / device management

## Open Questions

None — all decisions resolved during interview.
