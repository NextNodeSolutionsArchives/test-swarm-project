# Dashboard — Spec

## Overview
Main view where authenticated users manage their tasks. Supports two view modes: a **list view** with free status transitions and a **kanban view** with drag-and-drop between fully customizable columns. Built as an Astro page with React islands for interactivity, backed by a local SQLite database via better-sqlite3.

## Context
The dashboard is part of the Pulseo SaaS application. Authentication is being built in parallel (see `auth.spec.md`). The dashboard uses a feature flag (`AUTH_ENABLED` env var) to toggle between mock auth (hardcoded user) and real JWT auth. When `AUTH_ENABLED=false` (default), a mock middleware injects a fake userId so development can proceed independently.

The visual design matches the existing landing page: dark theme (#0A0A0F base), glassmorphism surfaces, green (#00D67E) and orange (#FF6B35) accents, Inter + JetBrains Mono fonts.

## Functional Requirements

- **FR-1**: Display all tasks for the current user in a scrollable list (default view), sorted by `position` ascending
- **FR-2**: Create a task via an inline form at the top of the list/column — fields: title (required, max 200 chars), description (optional, max 2000 chars), status (default: first column's status)
- **FR-3**: Edit a task inline — click a task to expand it into an editable form; can update title, description, and status
- **FR-4**: Delete a task with a toast-with-undo pattern: task is soft-deleted immediately, a toast appears for 10 seconds with an "Undo" button; after 10 seconds the deletion is committed permanently
- **FR-5**: Filter tasks by status via filter tabs (All + one tab per custom column); active filter is highlighted; filter is reflected in URL query param `?status=<value>`
- **FR-6**: Search tasks by title/description with a debounced (300ms) client-side text input; filters the currently displayed tasks in real-time
- **FR-7**: Toggle between **list view** and **kanban view** via a view switcher in the toolbar
- **FR-8**: In kanban view, display tasks in columns grouped by status; support drag-and-drop to move tasks between columns (updates status) and within columns (updates position)
- **FR-9**: In list view, support drag-to-reorder tasks (updates position); status is changed via a dropdown in the inline edit form
- **FR-10**: Custom columns — users can create, rename, reorder, and delete columns; each column maps to a status value; no system-enforced defaults (user starts with "Todo", "In Progress", "Done" as seed data but can fully customize)
- **FR-11**: Persist view preference (list vs kanban) in localStorage, with URL param `?view=list|kanban` overriding if present
- **FR-12**: Responsive layout — works on mobile (single-column stacked), tablet (2-column kanban), and desktop (full kanban + sidebar)
- **FR-13**: Empty state — when no tasks exist, show a friendly illustration/message with a CTA to create the first task
- **FR-14**: Auth feature flag — when `AUTH_ENABLED=false`, use a mock middleware returning `userId = "mock-user-001"`; when `true`, use real JWT auth from cookie (compatible with auth.spec.md)

## Data Model

```
columns table:
  - id: text (uuid, primary key)
  - user_id: text (foreign key -> users.id)
  - name: text (not null, max 50 chars)
  - status_value: text (not null, unique per user, max 50 chars, kebab-case)
  - position: integer (not null, for ordering columns)
  - color: text (optional, hex color for kanban column header)
  - created_at: integer (unix timestamp)

tasks table:
  - id: text (uuid, primary key)
  - user_id: text (foreign key -> users.id)
  - title: text (not null, max 200 chars)
  - description: text (optional, max 2000 chars)
  - status: text (not null, references columns.status_value)
  - position: integer (not null, for ordering within a column/list)
  - created_at: integer (unix timestamp)
  - updated_at: integer (unix timestamp)
  - deleted_at: integer (nullable, unix timestamp — for soft delete during undo window)
```

Seed data for new users:
- Column 1: name="Todo", status_value="todo", position=0, color="#3B82F6"
- Column 2: name="In Progress", status_value="in-progress", position=1, color="#F59E0B"
- Column 3: name="Done", status_value="done", position=2, color="#00D67E"

## API Contract

All endpoints are prefixed with `/api`. All require authentication (real or mock based on `AUTH_ENABLED`).

### Tasks

**`GET /api/tasks`**
- Query params: `?status=<status_value>` (optional filter)
- Response `200`: `{ tasks: Task[] }`
- Tasks are returned sorted by `position` ascending
- Excludes soft-deleted tasks (where `deleted_at` is not null and within undo window)

**`POST /api/tasks`**
- Body: `{ title: string, description?: string, status?: string }`
- `status` defaults to the first column's `status_value` if omitted
- `position` is auto-assigned (max position + 1 in the target column)
- Response `201`: `{ task: Task }`
- Errors: `400` if title is empty or exceeds 200 chars, `400` if status doesn't match any column

**`PUT /api/tasks/:id`**
- Body: `{ title?: string, description?: string, status?: string, position?: number }`
- Response `200`: `{ task: Task }`
- Errors: `400` validation, `404` not found, `403` not owned by user

**`DELETE /api/tasks/:id`**
- Sets `deleted_at` to current timestamp (soft delete)
- Response `200`: `{ deletedAt: number }`
- Errors: `404` not found, `403` not owned by user

**`POST /api/tasks/:id/restore`**
- Clears `deleted_at` (undo delete)
- Response `200`: `{ task: Task }`
- Errors: `404` not found or already permanently deleted, `403` not owned by user

**`POST /api/tasks/reorder`**
- Body: `{ taskIds: string[], status?: string }` — ordered list of task IDs representing new positions, optionally within a status column
- Response `200`: `{ success: true }`

### Columns

**`GET /api/columns`**
- Response `200`: `{ columns: Column[] }` — sorted by `position`

**`POST /api/columns`**
- Body: `{ name: string, statusValue: string, color?: string }`
- `position` auto-assigned (appended to end)
- Response `201`: `{ column: Column }`
- Errors: `400` if `statusValue` already exists for user, `400` if name is empty

**`PUT /api/columns/:id`**
- Body: `{ name?: string, statusValue?: string, color?: string, position?: number }`
- Response `200`: `{ column: Column }`
- If `statusValue` changes, all tasks with the old status are updated to the new value
- Errors: `400` validation, `404` not found

**`DELETE /api/columns/:id`**
- Errors: `400` if column has tasks (must move/delete tasks first), `404` not found
- Response `200`: `{ success: true }`

**`POST /api/columns/reorder`**
- Body: `{ columnIds: string[] }` — ordered list of column IDs
- Response `200`: `{ success: true }`

## UI/UX Requirements

### Layout
- Dashboard page at `/dashboard`
- Top toolbar: search bar (left), view toggle (center), "Add Task" button (right)
- Below toolbar: filter tabs (All + one per column)
- Main area: task list or kanban board depending on view mode
- Glassmorphism cards (`.glass` class) for task cards
- Dark background matching landing page (`#0A0A0F`)

### Task Card
- Shows title, truncated description (2 lines), status badge (colored per column), relative time ("2h ago")
- Hover: subtle surface highlight (`surface-hover`)
- Click: expands inline to editable form
- Delete icon (top-right corner on hover) — triggers soft-delete + toast

### Inline Form (Create/Edit)
- Appears at the top of the list (create) or replaces the task card (edit)
- Title input (auto-focused), description textarea (collapsible), status dropdown
- Save/Cancel buttons; Escape key cancels; Cmd+Enter saves
- Validation: title required, shown as red border + helper text

### Kanban View
- Columns side by side, horizontally scrollable on smaller screens
- Column header: name (editable on double-click), task count, color indicator, "+" button to add task, "..." menu (rename, change color, delete)
- Cards are draggable between columns and within columns
- Drop zone highlight on drag-over
- Add column button at the end (right side)

### Toast Notification
- Bottom-right corner, fixed position
- Shows "Task deleted" message with "Undo" button
- 10-second countdown visual (progress bar)
- Auto-dismisses after 10 seconds
- Multiple toasts stack vertically

### Responsive Breakpoints
- Mobile (< 640px): single-column layout, kanban shows one column at a time with horizontal swipe
- Tablet (640px–1024px): 2-column kanban, collapsible sidebar
- Desktop (> 1024px): full kanban with all columns visible

### Empty State
- Centered illustration or icon
- "No tasks yet" heading
- "Create your first task to get started" subtext
- Primary CTA button styled with green gradient

## Edge Cases

- **Concurrent edits**: last-write-wins (no optimistic locking for v1)
- **Delete column with tasks**: API returns 400; UI shows warning "Move or delete X tasks first"
- **Rename column status_value**: cascading update to all tasks with that status
- **Undo after page navigation**: undo is lost if user navigates away; soft-deleted tasks are cleaned up by a periodic check (on page load, delete tasks where `deleted_at` is older than 60 seconds)
- **Drag-and-drop on mobile**: use long-press to initiate drag (touch-friendly)
- **Very long task titles**: truncate with ellipsis in card view, show full in edit mode
- **Max columns**: limit to 10 columns per user to prevent UI overflow
- **Search with special characters**: escape regex-special chars; search is case-insensitive

## Security

- All API endpoints validate that the task/column belongs to the requesting user (`user_id` match)
- Input sanitization: strip HTML tags from title and description before storage
- SQL injection prevention: use parameterized queries (better-sqlite3 supports this natively)
- Rate limiting: not required for v1 (local SQLite, single-user focus)
- Feature flag `AUTH_ENABLED` must default to `false` in development and `true` in production

## Performance

- Initial page load: < 2 seconds (server-rendered shell, React hydrates interactively)
- Task list rendering: virtualize if > 100 tasks (use `react-window` or similar)
- Drag-and-drop: 60fps during drag operations; batch position updates in a single API call
- Debounced search: 300ms delay to avoid excessive re-renders
- SQLite queries: indexed on `user_id`, `status`, `position`, `deleted_at`

## Dependencies

- **better-sqlite3**: SQLite driver for Node.js
- **@dnd-kit/core + @dnd-kit/sortable**: Drag-and-drop library for React (lightweight, accessible)
- **sonner** or similar: Toast notification library (or custom implementation)
- Existing stack: Astro, React, Tailwind CSS v4, TypeScript

## Out of Scope

- Real-time collaboration / multi-user sync
- File attachments on tasks
- Due dates, priority levels, tags/labels (future iteration)
- Task comments or activity log
- Export/import tasks
- Notifications / reminders
- Offline support / PWA

## Open Questions

(none — all questions resolved during interview)

## Revision History
- **2026-02-07**: Deepened from original spec — added formal FRs, custom columns, kanban view, drag-and-drop, search, responsive layout, toast-with-undo delete, auth feature flag, full API contract, data model with columns table, UI/UX details, edge cases, security and performance sections
