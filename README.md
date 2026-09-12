# Velozity Client Project Dashboard

[![Live Frontend](https://img.shields.io/badge/Frontend-Vercel-blue?style=for-the-badge&logo=vercel)](https://github.com/shivachandirank/velozity-client-project-dashboard)
[![Live Backend](https://img.shields.io/badge/Backend-Render-green?style=for-the-badge&logo=render)](https://github.com/shivachandirank/velozity-client-project-dashboard)
[![Build & Tests](https://img.shields.io/badge/Tests-13%2F13%20Passed-brightgreen?style=for-the-badge)](https://github.com/shivachandirank/velozity-client-project-dashboard)

Full-stack TypeScript implementation for the Velozity Technical Assessment. Built with Node.js, Express, Prisma ORM, PostgreSQL, Socket.IO, node-cron, React, Vite, TanStack Query, Zustand, and Tailwind CSS.

---

## 🚀 Local Setup Instructions

### 1. Configure Environment
Copy `.env.example` to create local `.env` files in root and `server/`:
```bash
cp .env.example .env
cp .env.example server/.env
```

### 2. Method A: Docker Setup (Preferred)
Start the PostgreSQL container via Docker Compose:
```bash
# 1. Start PostgreSQL container
docker-compose up -d

# 2. Install workspace dependencies
npm install

# 3. Push schema & run database seed script
cd server
npm run prisma:push
npm run seed
cd ..

# 4. Start concurrent client & server dev servers
npm run dev
```

### 3. Method B: Manual Local Setup (Alternative)
If running an existing PostgreSQL instance on port `5432`:
```bash
# 1. Update DATABASE_URL in .env to point to your local PostgreSQL instance
DATABASE_URL="postgresql://postgres:password@localhost:5432/velozity_db?schema=public"

# 2. Install dependencies, push schema, and seed
npm install
cd server
npm run prisma:push
npm run seed
cd ..

# 3. Launch application
npm run dev
```

- **Client**: `http://localhost:5173`
- **Server API**: `http://localhost:5000`

### 4. Run Automated Test Suite
```bash
cd server
npm run test
```

---

## 📊 Database Schema Diagram & Description

```mermaid
erDiagram
    User ||--o{ Project : "owns (PM)"
    User ||--o{ Task : "assignedTo (Dev)"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Notification : "receives"
    User ||--o{ RefreshToken : "owns"
    Client ||--o{ Project : "has"
    Project ||--o{ Task : "contains"
    Project ||--o{ ActivityLog : "logs"
    Task ||--o{ ActivityLog : "tracks"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        Role role "ADMIN | PROJECT_MANAGER | DEVELOPER"
        datetime createdAt
        datetime updatedAt
        datetime lastSeenAt
        boolean isActive
    }

    Client {
        string id PK
        string name
        string email
        string company
        datetime createdAt
    }

    Project {
        string id PK
        string name
        string description
        string clientId FK
        string ownerId FK
        datetime createdAt
    }

    Task {
        string id PK
        string title
        string description
        string projectId FK
        string assignedDeveloperId FK
        TaskStatus status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        Priority priority "LOW | MEDIUM | HIGH | CRITICAL"
        datetime dueDate
        boolean isOverdue
    }

    ActivityLog {
        string id PK
        string projectId FK
        string taskId FK
        string userId FK
        string action
        TaskStatus previousStatus
        TaskStatus newStatus
        string description
        datetime createdAt
    }

    Notification {
        string id PK
        string recipientId FK
        string actorId FK
        string taskId FK
        string projectId FK
        NotificationType type "TASK_ASSIGNED | TASK_IN_REVIEW"
        string message
        boolean isRead
        datetime createdAt
    }

    RefreshToken {
        string id PK
        string userId FK
        string tokenHash UK
        datetime expiresAt
        datetime revokedAt
    }
```

### Table Schema & Indexing Rationale
- **`User`**: Indexes on `email` (fast lookup during login) and `role` (team filtering).
- **`Project`**: Foreign key indexes on `ownerId` (PM project permission checks) and `clientId`.
- **`Task`**: Indexes on `projectId`, `assignedDeveloperId` (Developer task isolation), `status`, `priority`, `dueDate`, `isOverdue` (overdue cron job queries), and composite index `[projectId, status]`.
- **`ActivityLog`**: Indexes on `projectId`, `taskId`, `userId`, `createdAt`, and composite index `[projectId, createdAt]` for rapid, role-filtered missed event catchup queries.
- **`Notification`**: Indexes on `recipientId`, `isRead`, `createdAt`, and composite index `[recipientId, isRead]` (fast unread count aggregations).
- **`RefreshToken`**: Index on `userId` and unique index on `tokenHash` (efficient token rotation & revocation).

---

## 🏗️ Architectural Decisions

### 1. WebSocket Library Choice: Socket.IO
- **Why Socket.IO over raw WebSockets (`ws`)**:
  - **Native Room Abstractions**: Socket.IO natively supports channels/rooms (`project:{id}`, `user:{id}`, `admin:global`), allowing role-scoped broadcasting without writing custom pub/sub room management.
  - **Authentication Handshake**: Integrates seamlessly with Express/JWT authentication during connection establishment (`socket.handshake.auth`).
  - **Connection State Recovery & Automatic Reconnection**: Provides automatic reconnect handling out of the box when network connectivity drops.

### 2. Job Queue Choice: In-Process `node-cron`
- **Why `node-cron` over `BullMQ` + `Redis`**:
  - **Assessment Scope & Simplicity**: For single-instance execution, `node-cron` evaluates overdue tasks every hour (and on startup) without requiring an additional Redis infrastructure dependency.
  - **Transactional Safety**: Overdue checks execute transactional status queries (`UPDATE Task SET isOverdue = true WHERE dueDate < NOW() AND status != 'DONE'`), preventing race conditions.
  - *Production Trade-off*: In a distributed multi-node production setup, BullMQ with Redis locks would be used to prevent duplicate execution across cluster replicas.

### 3. Token Storage Approach: Dual-Token Architecture
- **JWT Access Token (15 Minutes)**: Short-lived access tokens stored strictly in client memory (`Zustand` store) and attached via Axios request headers (`Authorization: Bearer <token>`). Prevents XSS token exfiltration.
- **Refresh Token (7 Days)**:
  - Stored in an `HTTP-Only`, `SameSite=Lax`, `Secure` cookie.
  - Persisted in PostgreSQL (`RefreshToken` table) as a cryptographic SHA-256 hash.
  - **Refresh Token Rotation**: Upon calling `POST /api/auth/refresh`, the old refresh token is immediately revoked and replaced with a newly generated hashed token pair.

---

## ⚠️ Known Limitations

1. **Multi-Node WebSocket Scaling**:
   - Current socket connection presence and rooms are managed in-memory on a single node instance.
   - *Mitigation for scale*: Horizontal scaling across multiple server instances requires attaching a Socket.IO Redis Adapter (`@socket.io/redis-adapter`) for cross-node event broadcasting.

2. **Distributed Job Locks**:
   - The background overdue job runs in-process using `node-cron`. If multiple application servers are spun up behind a load balancer, each server would trigger the cron job independently.
   - *Mitigation for scale*: Transition background jobs to a Redis-backed queue like BullMQ with distributed locking.

3. **In-Memory Presence Tracking**:
   - Online user presence counts are computed using an in-memory `Set` of active user socket IDs.
   - *Mitigation for scale*: Store active presence heartbeats in a Redis key-value store with TTLs.

---

## 🔑 Demo Credentials

Password for all pre-seeded accounts: **`Password123!`**

| Role | Email | Access Scope |
| :--- | :--- | :--- |
| **Admin** | `admin@velozity.demo` | Unrestricted global access to all clients, projects, tasks, and users |
| **Project Manager 1** | `pm1@velozity.demo` | Manages Website Redesign & Mobile App projects |
| **Project Manager 2** | `pm2@velozity.demo` | Manages Enterprise ERP System project |
| **Developer 1** | `dev1@velozity.demo` | Assigned to tasks in Website Redesign & Mobile App |
| **Developer 2** | `dev2@velozity.demo` | Assigned to tasks in Website Redesign |
| **Developer 3** | `dev3@velozity.demo` | Assigned to tasks in Mobile App |
| **Developer 4** | `dev4@velozity.demo` | Assigned to tasks in Enterprise ERP System |

---

## 🧪 Running Tests

```bash
cd server
npm run test
```
Runs the full Vitest suite covering API endpoints, role-based access control, task status updates, notifications, overdue jobs, and missed event catchup filtering.
