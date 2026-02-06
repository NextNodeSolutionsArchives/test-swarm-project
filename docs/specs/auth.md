# Authentication Spec

## Overview
Simple email + password authentication using JWT tokens.

## Registration
- Fields: email, password, confirm password
- Validation:
  - Email must be valid format
  - Password minimum 8 characters, at least 1 number and 1 uppercase letter
  - Confirm password must match
- On success: create user in DB, redirect to login
- On failure: show inline validation errors

## Login
- Fields: email, password
- On success: issue JWT token, store in httpOnly cookie, redirect to `/dashboard`
- On failure: show generic "Invalid credentials" error (don't reveal which field is wrong)

## JWT Token
- Payload: `{ userId, email, iat, exp }`
- Expiry: 24 hours
- Stored in httpOnly secure cookie

## Middleware
- Protected routes check for valid JWT in cookie
- If missing or expired, redirect to `/login`

## API Endpoints
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate and return token
- `POST /api/auth/logout` - Clear auth cookie

## Database Schema
```
users table:
  - id: text (uuid, primary key)
  - email: text (unique, not null)
  - password_hash: text (not null)
  - created_at: integer (timestamp)
```
