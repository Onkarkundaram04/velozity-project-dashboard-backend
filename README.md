# Real-Time Client Project Dashboard (Backend API) — **Built with AI Assistance (Honest Disclosure)**

A clean, modular REST API built with Node.js, Express, PostgreSQL, and Prisma ORM enforcing strict Role-Based Access Control (RBAC) and automated background task management.

---

## 📢 Candidate Statement & Skill Disclosure

* **Transparency & AI Disclosure:**  
  I utilized AI tools as an assistant to architect and scaffold this backend implementation within the given time. My prior database experience was exclusively with **MongoDB (NoSQL)**; relational databases (PostgreSQL) and Prisma ORM were completely new to me, so AI heavily assisted in designing the relational schema, foreign key relations, and Prisma queries.
* **Current Skill Profile:**  
  * **Focus:** I am actively learning backend engineering. Prior to this assessment, my experience was centered on Node.js/Express with MongoDB. I am comfortable with basic REST APIs, MVC structure, JWT authentication, and simple CRUD operations.
  * **Frontend Status:** I currently have foundational knowledge of HTML, CSS, and basic JavaScript. I have not yet learned React or TypeScript, so the frontend was omitted rather than presenting unvetted code.
  * **Scope & Learning:** Real-time WebSockets, distributed event streaming, and complex queues are advanced concepts I have not yet mastered. I chose to submit an honest, functioning backend that reflects where I am currently learning.

---

## 🛠️ Implemented Architecture & Features

1. **Authentication & Token Lifecycle:**
   * Short-lived JWT `access_token` (15 minutes).
   * Long-lived `refresh_token` (7 days) stored securely in an **HttpOnly cookie** and recorded in the database.
   * Endpoints: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`.

2. **Strict API-Level RBAC:**
   * **Admin:** Full access across all projects, tasks, and activities.
   * **Project Manager:** Can create projects and tasks. Strictly isolated to their own projects (`created_by_id`). Cannot access or edit projects owned by another PM.
   * **Developer:** Strictly limited to viewing and updating tasks assigned to their user ID (`assigned_to_id`). Blocked from project-level management.

3. **Task Status Updates & Activity Logging:**
   * Changing a task's status records an immutable database log in `activity_logs` (e.g., *"Devon Dave moved Task #1 from IN_PROGRESS -> DONE"*).
   * Supports role-filtered retrieval of the last 20 events via `GET /api/activities`.

4. **Background Overdue Task Scheduler:**
   * Built with `node-cron` running periodically (`*/5 * * * *`).
   * Automatically scans and flips tasks where `due_date < NOW` and `status != DONE` to `OVERDUE`.

---

## 🗄️ Database Schema & Indexing Rationale

* **`users`:** `id`, `name`, `email`, `password`, `role` (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`), `refresh_token`.
* **`projects`:** `id`, `title`, `description`, `client_name`, `created_by_id`.
  * **Index on `created_by_id`:** Enables fast filtering when Project Managers fetch their own projects.
* **`tasks`:** `id`, `title`, `description`, `status`, `priority`, `due_date`, `project_id`, `assigned_to_id`.
  * **Index on `project_id` & `assigned_to_id`:** Speeds up relational joins and developer-assigned task queries.
  * **Index on `status`:** Accelerates query parameter filtering and background overdue scans.
* **`activity_logs`:** `id`, `task_id`, `user_id`, `action_text`, `created_at`.
  * **Index on `task_id` & `user_id`:** Optimizes role-based feed lookups and historical sorting.

---

## 🚀 Quick Setup Instructions

### 1. Prerequisites
* Node.js (v18+)
* PostgreSQL running locally or hosted (e.g., Neon / Supabase)

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/dashboard_db?schema=public"
JWT_ACCESS_SECRET="super_secret_access_key_123"
JWT_REFRESH_SECRET="super_secret_refresh_key_456"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Database & Seed Test Data
```bash
npx prisma db push
node prisma/seed.js
```

### 5. Start Server
```bash
npm start
```
* Server runs on `http://localhost:5000`.

---

## 🔑 Seeded Test Accounts (Password: `password123`)

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | Full visibility over all projects, tasks, and logs |
| **Project Manager 1** | `pm1@example.com` | Manages Project 1 and Project 2 |
| **Project Manager 2** | `pm2@example.com` | Manages Project 3 (isolated from PM 1) |
| **Developer 1** | `dev1@example.com` | Assigned tasks on Project 1 & 3 |
| **Developer 2** | `dev2@example.com` | Assigned tasks on Project 1 & 3 |
| **Developer 3** | `dev3@example.com` | Assigned tasks on Project 2 & 3 |
| **Developer 4** | `dev4@example.com` | Assigned tasks on Project 2 & 3 |

---

## 📡 API Endpoints Overview

| Route | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates and returns JWT + sets cookie |
| `/api/auth/refresh` | `POST` | Public | Refreshes access token via HttpOnly cookie |
| `/api/auth/logout` | `POST` | Public | Clears refresh token cookie and DB record |
| `/api/projects` | `GET` | Admin, PM | Role-filtered list of projects |
| `/api/projects` | `POST` | Admin, PM | Creates a project (assigned to logged-in PM) |
| `/api/tasks` | `GET` | All | Role-filtered tasks (supports `?status=&priority=&from_date=&to_date=`) |
| `/api/tasks` | `POST` | Admin, PM | Creates and assigns a task |
| `/api/tasks/:id/status`| `PATCH` | All | Updates task status & records activity log |
| `/api/activities` | `GET` | All | Role-filtered recent 20 activity logs |
