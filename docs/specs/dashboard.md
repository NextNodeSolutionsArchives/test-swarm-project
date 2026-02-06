# Dashboard Spec

## Overview
Main view where authenticated users manage their tasks.

## Task Model
```
tasks table:
  - id: text (uuid, primary key)
  - user_id: text (foreign key -> users.id)
  - title: text (not null, max 200 chars)
  - description: text (optional, max 2000 chars)
  - status: text (enum: "todo" | "in_progress" | "done")
  - created_at: integer (timestamp)
  - updated_at: integer (timestamp)
```

## Task List View
- Display all tasks for the logged-in user
- Show title, status badge, and created date
- Sort by created_at descending (newest first)
- Empty state message when no tasks exist

## Create Task
- Button opens a modal/form
- Fields: title (required), description (optional), status (default: "todo")
- On success: add task to list, close modal

## Edit Task
- Click task to open edit form
- Can update title, description, status
- On success: update in list

## Delete Task
- Delete button on each task (with confirmation)
- On success: remove from list

## Filter by Status
- Filter buttons/tabs: All, Todo, In Progress, Done
- Active filter highlighted
- URL query param: `?status=todo`

## API Endpoints
- `GET /api/tasks` - List user's tasks (supports `?status=` filter)
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- All endpoints require authentication
