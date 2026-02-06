# TaskFlow - Project Overview

## Goal
Build a simple task management web app where users can create, organize, and track their tasks.

## Tech Stack
- **Framework**: Astro with React islands
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: JWT-based authentication
- **Database**: SQLite via Drizzle ORM
- **Testing**: Vitest (unit) + Playwright (e2e)

## Core Features
1. **Authentication** - Email/password login and registration (see `auth.md`)
2. **Dashboard** - Task list with CRUD operations and filtering (see `dashboard.md`)

## Pages
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main task dashboard (protected)

## Non-Goals (for now)
- No team/collaboration features
- No real-time updates
- No mobile app
