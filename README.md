# Velozity Client Project Dashboard

Full-stack TypeScript implementation for the Velozity technical assessment. Built with Express, Node.js, Prisma ORM, PostgreSQL, Socket.IO, node-cron, React, Vite, TanStack Query, and Tailwind CSS.

---

## Technical Assessment Explanation

The most technical part of this assessment was ensuring data security and real-time updates were enforced consistently across both REST endpoints and WebSockets without incurring excessive database latency.

For real-time activity updates, I chose Socket.IO over raw WebSockets because Socket.IO provides native room abstractions (`project:{id}`, `user:{id}`) and connection state recovery out of the box. During the initial socket handshake, the server verifies the JWT access token and assigns the authenticated user payload to `socket.data.user`. Room join requests (`join:project`) are validated against database permissions—so Project Managers can only join rooms for projects they own, and Developers can only join rooms where they have active task assignments. When a status transition occurs, it executes inside a Prisma `$transaction` that updates the task, logs an `ActivityLog` row, and creates a `Notification`. The server then multi-casts `activity:created` and `notification:created` events only to authorized client rooms.

To handle offline catch-up, clients call `GET /api/activity/recent` upon reconnection. Rather than storing transient events in an in-memory queue that would get lost on process restarts, the endpoint queries PostgreSQL directly with role-based filters (global for Admins, owned projects for PMs, assigned tasks for Devs) returning the latest 20 activity records.

Security is enforced on every API route using reusable Express middleware (`authenticate`, `authorizeRoles`, `authorizeProjectAccess`, `authorizeTaskAccess`). Attempting to tamper with task or project IDs in the URL results in an immediate 403 Forbidden response backed by database checks against `req.user.id`.

If I had more time, I would set up a Redis adapter for multi-node Socket.IO scaling and use BullMQ with Redis for distributed background job execution across cluster instances.

---

## Architecture Overview

```
client/ (React + Vite + TS + Tailwind + TanStack Query)
   │
   ├── REST Requests (JWT Access Token in header)
   └── WebSockets (Socket.IO + Auth Handshake)
   │
server/ (Express + TS + Prisma + Socket.IO + node-cron)
   │
   ├── Routes & Middleware (JWT verification + Strict RBAC)
   ├── Services & Transactions (Prisma $transaction for Task + ActivityLog)
   └── Background Cron (node-cron for overdue tasks)
   │
PostgreSQL Database
```

---

## Database Schema & Indexing Decisions

The database uses PostgreSQL with Prisma ORM. Indexes were placed on foreign keys and columns frequently used in filtering and sorting:

- **User**: `email` (unique lookup during login), `role` (team filtering)
- **Project**: `ownerId` (PM project permission checks), `clientId` (client aggregations)
- **Task**: `projectId`, `assignedDeveloperId` (dev task isolation), `status`, `priority`, `dueDate`, `isOverdue` (overdue cron job & URL filters), composite `[projectId, status]`
- **ActivityLog**: `projectId`, `taskId`, `userId`, `createdAt`, composite `[projectId, createdAt]` (fast 20-item catch-up queries)
- **Notification**: `recipientId`, `isRead`, `createdAt`, composite `[recipientId, isRead]` (unread count queries)
- **RefreshToken**: `userId`, `expiresAt` (token rotation and revocation lookups)

---

## Project Structure

```
velozity-client-project-dashboard/
├── client/                     # React Vite TypeScript frontend
│   ├── src/
│   │   ├── components/         # UI components & modals
│   │   ├── hooks/              # Custom auth and data hooks
│   │   ├── layouts/            # Sidebar layout & header
│   │   ├── lib/                # Axios instance with 401 refresh interceptors
│   │   ├── pages/              # Role dashboards & views
│   │   ├── services/           # Socket.IO client manager
│   │   ├── stores/             # Zustand in-memory auth store
│   │   └── types/              # TS interface definitions
├── server/                     # Express TypeScript backend
│   ├── prisma/
│   │   ├── schema.prisma       # Relational models & indexes
│   │   └── seed.ts             # Seeding script
│   ├── src/
│   │   ├── config/             # Zod environment parser
│   │   ├── controllers/        # Express HTTP controllers
│   │   ├── jobs/               # Scheduled overdue cron job
│   │   ├── middleware/         # Auth, RBAC, and error handlers
│   │   ├── repositories/       # Database access queries
│   │   ├── routes/             # API routing
│   │   ├── services/           # Business logic & DB transactions
│   │   ├── sockets/            # Socket.IO authentication & presence
│   │   └── validators/         # Zod request validators
├── docker-compose.yml          # PostgreSQL container configuration
├── .env.example                # Environment template
└── package.json                # Monorepo workspaces setup
```

---

## Demo Credentials

Password for all development accounts: **`Password123!`**

| Role | Email | Notes |
| :--- | :--- | :--- |
| **Admin** | `admin@velozity.demo` | Full access across all clients, projects, tasks, users |
| **Project Manager 1** | `pm1@velozity.demo` | Manages Website Redesign & Mobile App projects |
| **Project Manager 2** | `pm2@velozity.demo` | Manages Enterprise ERP System project |
| **Developer 1** | `dev1@velozity.demo` | Assigned to tasks in Website Redesign & Mobile App |
| **Developer 2** | `dev2@velozity.demo` | Assigned to tasks in Website Redesign |
| **Developer 3** | `dev3@velozity.demo` | Assigned to tasks in Mobile App |
| **Developer 4** | `dev4@velozity.demo` | Assigned to tasks in Enterprise ERP System |

---

## Development Setup

### 1. Configure Environment
Copy `.env.example` to `.env` in root and `server/`:
```bash
cp .env.example .env
cp .env.example server/.env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database & Seed
Make sure PostgreSQL is running on port `5432` (or via docker-compose), then push schema and seed demo data:
```bash
cd server
npm run prisma:push
npm run seed
cd ..
```

### 4. Run Development Server
```bash
npm run dev
```
- App: `http://localhost:5173`
- API: `http://localhost:5000`

### 5. Run Test Suite
```bash
npm run test
```
