# Secure Task Management System (RBAC + JWT) — NX Monorepo

Repo name format requested: **first-initial + last-name + uuid** → `sreddy-3b74d3db-679f-4c83-8319-e447cc74d63c`

This repository contains:

- `apps/api` — **NestJS** backend with **TypeORM** + **SQLite** and **JWT (JSON Web Token)** authentication
- `apps/dashboard` — **Angular** frontend with **TailwindCSS**, **JWT (JSON Web Token)** login, and task dashboard UI
- `libs/data` — Shared **TypeScript** types + DTO (Data Transfer Object) contracts
- `libs/auth` — Reusable **RBAC (Role-Based Access Control)** logic + NestJS decorators/guard

---

## 1) Setup Instructions

### Prereqs
- **Node.js** 18+ (recommended 20+)
- npm (or pnpm/yarn)

### Install
```bash
npm install
```

### Environment Configuration

Create `.env` at repo root:

```bash
# API
API_PORT=3000
JWT_SECRET=dev_super_secret_change_me
JWT_EXPIRES_IN=3600s

# DB (SQLite)
DB_TYPE=sqlite
DB_PATH=./data.sqlite

# Seed (optional, dev only)
SEED_ON_BOOT=true
```

### Run Backend (API)
```bash
npm run api
```

API defaults to: `http://localhost:3000`

### Run Frontend (Dashboard)
```bash
npm run dashboard
```

Dashboard defaults to: `http://localhost:4200`

> The dashboard uses a proxy to call the API at `/api/*` in dev.

---

## 2) Architecture Overview

### NX Monorepo Layout
```
apps/
  api/         NestJS API
  dashboard/   Angular UI
libs/
  data/        shared interfaces + DTO shapes
  auth/        RBAC roles/permissions + decorators/guard
```

**Rationale**

- `libs/data` prevents backend/frontend drift in request/response shapes.
- `libs/auth` keeps RBAC primitives (roles, permissions, decorator) reusable and testable.
- `apps/api` contains resource-level checks (task ownership + org hierarchy), because they need database access.

---

## 3) Data Model Explanation

### Entities
- **Organization**: 2-level hierarchy (parent → child)
- **User**: belongs to exactly one Organization, has one Role
- **Task**: belongs to an Organization, created by a User
- **AuditLog**: tracks access attempts and outcomes

### ERD (ASCII)
```
Organization (id, name, parentId?)
   1  ────────  *   User (id, email, passwordHash, role, organizationId)
   1  ────────  *   Task (id, title, status, category, order, organizationId, createdById)
   1  ────────  *   AuditLog (id, ts, action, path, method, userId, outcome, resourceId?, orgId?)
Organization parentId -> Organization.id  (2-level)
```

---

## 4) Access Control Implementation

### Roles
- **Owner**: full access + can view audit logs
- **Admin**: manage tasks + can view audit logs
- **Viewer**: read-only task access

### Permission Mapping (role inheritance)
Owner ⟶ Admin ⟶ Viewer

- Viewer: `task:read`
- Admin: `task:create`, `task:read`, `task:update`, `task:delete`, `audit:read`
- Owner: all Admin permissions (and reserved for org owners)

### Organization Scope Rules (2-level)
A user can access tasks if:
- Task is in **their organization**, OR
- User is **Owner/Admin** in a **parent organization** and the task belongs to a direct child organization

### Ownership Rule (task owner)
- Viewer cannot modify tasks
- Admin/Owner can update/delete any task within their scope
- Tradeoff: we do not enforce “only creator can edit” because Admin/Owner are expected to manage resources.

### JWT Integration
- Login returns `{"accessToken": "<JWT>"}`.
- Token includes `sub` (user id), `orgId`, `role`.
- Every protected endpoint uses `JwtAuthGuard`.
- RBAC checks use `@Permissions(...)` + `RbacGuard`.
- Resource checks use `TaskAccessGuard`.

---

## 5) API Documentation

### Auth
- `POST /auth/login`
- `POST /auth/register` (dev-friendly; see Security Tradeoffs)

### Tasks
- `POST /tasks` — create task
- `GET /tasks` — list tasks scoped by org hierarchy + role
- `PUT /tasks/:id` — update task (RBAC + scope)
- `DELETE /tasks/:id` — delete task (RBAC + scope)

### Audit Logs
- `GET /audit-log` — Owner/Admin only

### Sample Requests

Login
```bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"owner@acme.com","password":"Password@123"}'
```

List tasks
```bash
curl http://localhost:3000/tasks   -H "Authorization: Bearer <TOKEN>"
```

Create task
```bash
curl -X POST http://localhost:3000/tasks   -H "Authorization: Bearer <TOKEN>"   -H "Content-Type: application/json"   -d '{"title":"Ship RBAC","category":"Work","status":"Todo"}'
```

---

## 6) Testing Strategy

### Backend (Jest)
- RBAC permission mapping tests
- Task scope tests (org + child org)
- Controller e2e smoke tests (login + CRUD)

Run:
```bash
npm run test:api
```

### Frontend (Jest)
- Unit tests for JWT decode helper

Run:
```bash
npm run test:dashboard
```

---

## 7) Future Considerations

- Advanced role delegation (per-project/per-team roles)
- Production-ready security:
  - Refresh tokens
  - Rotation + reuse detection
  - Rate limiting on `/auth/login`
- CSRF protection (if migrated to cookie-based auth)
- RBAC caching (e.g., Redis)
- Efficient scaling of permission checks

---

## 8) Tradeoffs / Unfinished Areas

- `POST /auth/register` exists for local convenience; production should be invite/admin-controlled.
- Drag-and-drop reorder sends multiple updates (simple); production would use a bulk reorder endpoint.
- Audit logging is DB + `audit.log` JSONL (simple, not centralized).

---

## 9) Demo Accounts (auto-seeded when SEED_ON_BOOT=true)

- Owner (parent org: Acme)
  - email: `owner@acme.com`
  - password: `Password@123`
- Admin (child org: Acme-Eng)
  - email: `admin@eng.acme.com`
  - password: `Password@123`
- Viewer (child org: Acme-Eng)
  - email: `viewer@eng.acme.com`
  - password: `Password@123`

---

