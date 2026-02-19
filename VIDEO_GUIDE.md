# 10-minute Video Walkthrough Script (Suggested)

## 0:00–0:45 — What you built
Explain: “Secure Task Management System with **JWT (JSON Web Token)** authentication + **RBAC (Role-Based Access Control)** + **2-level Organization hierarchy** in an **NX** monorepo.”

Show repo structure: `apps/api`, `apps/dashboard`, `libs/data`, `libs/auth`.

## 0:45–2:00 — Architecture & monorepo rationale
Highlight:
- Shared types in `libs/data` (frontend + backend contract)
- RBAC primitives in `libs/auth` (roles/permissions, decorators, guard)
- Resource-level checks live in API because they need DB access (org scope + task lookup)

## 2:00–3:30 — Data model + org hierarchy
Open `apps/api/src/entities/*`.
Explain:
- Organization has `parentId` (2-level)
- User has `organizationId` and `role`
- Task belongs to an organization + createdBy
- AuditLog stores outcomes and request info

Show the ERD section from README.

## 3:30–5:30 — Authentication (JWT) flow
Demo:
1) POST `/auth/login` to get token
2) Mention JWT payload: `sub`, `orgId`, `role`
3) Show `JwtStrategy` and `JwtAuthGuard`
4) Mention that all task endpoints are guarded

Optional: show password hashing with bcrypt.

## 5:30–7:30 — RBAC + access checks
Show `libs/auth`:
- Role -> permissions mapping (inheritance)
- `@Permissions()` decorator
- `RbacGuard`

Show API resource checks:
- org scope: same org OR parent-admin/owner accessing child org tasks
- `TaskAccessGuard` loads task and verifies scope + required permissions

State the concrete rules used.

## 7:30–8:45 — Audit logging
Open `AuditInterceptor` + `AuditLogService`.
Explain:
- Logs allowed and denied
- Stored in DB + appended to `audit.log` JSON lines
Demo `GET /audit-log` with Admin/Owner and show Viewer gets 403.

## 8:45–9:40 — Frontend demo
Login UI:
- JWT stored in localStorage
- Http interceptor attaches token

Tasks dashboard:
- Create/edit/delete
- Filter/sort/category
- Drag-drop reorder + status column changes

Explain state management choice (simple UI + API client calls).

## 9:40–10:00 — Tradeoffs and future work
Mention:
- registration endpoint dev-only
- would add refresh tokens, rate limiting, bulk reorder endpoint, centralized audit logs, caching org scopes.

End.
