# Planio — Fullstack Task & Ticket Management System

Planio is a modern task and development workflow platform built with **React (Vite)**, **Node.js (Express)**, and **PostgreSQL**. It links tasks directly with **GitHub repositories**, automatically generates **Ticket Keys** (e.g. `PLN-101`, `PLN-102`), and captures **Git commit pushes** directly into tickets in real-time.

---

## 🌟 Key Features

- **📊 Multi-View Boards**: Seamlessly switch between **Kanban Board** (with smooth drag-and-drop), **Table View**, and **List View**.
- **🎫 Automatic Ticket Keys**: Every task created automatically receives a standardized ticket identifier (e.g., `PLN-101`, `PLN-102`, `PLN-105`).
- **🔀 Git Commit Linking**: Commits referencing a ticket key (e.g. `git commit -m "PLN-101: Add user login"`) are automatically attached to that ticket with commit hash, author, branch, and GitHub link.
- **⚡ GitHub Webhook & Auto-Close**: Push events sent to `/api/webhooks/github` automatically link commits. Keywords like `Fixes PLN-101` or `Closes PLN-101` automatically advance tickets to **Done (100% progress)**.
- **🐙 GitHub Repository Sync**: Connect any public or private GitHub repository, import issues directly as tasks, and create remote issues via the GitHub REST API.
- **🔐 User Authentication & PostgreSQL DB**: User registration, login with JWT tokens, bcrypt password hashing, and PostgreSQL database storage with automatic schema migrations.
- **🎨 Modern Glassmorphic UI**: High-end dark/light theme, custom scrollbars, animated transitions, and toast notifications.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Optional: the backend automatically uses a persistent local store if PostgreSQL is offline)

---

### Step 1: Start the Backend Server

```bash
# Navigate into the server directory
cd server

# Install backend dependencies
npm install

# Start the Node.js API server
npm start
```

> The backend will start on **`http://localhost:5000`**.
> Healthcheck endpoint: **`http://localhost:5000/api/health`**

#### Backend Environment Variables (`server/.env`)
Create or edit `server/.env` with your database credentials:
```env
PORT=5000
JWT_SECRET=planio_super_secret_jwt_key_2026_modern_secure
NODE_ENV=development

# PostgreSQL Connection Configuration
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=planio
PGPORT=5432

# Or connection URL:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/planio
```

---

### Step 2: Start the Frontend Application

Open a new terminal window at the project root:

```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

> Open your browser at **`http://localhost:5173/`** (or the port shown in your terminal).

---

## 🗄️ PostgreSQL Database Schema

When the backend starts, it automatically creates the required tables and seeds default team accounts and starter tasks:

- **`users`**: User accounts with hashed passwords, roles, colors, and initials.
- **`repositories`**: Connected GitHub repositories.
- **`tasks`**: Tasks/tickets containing `ticket_key`, status, priority, progress, assignees, and GitHub metadata.
- **`commits`**: Git commits attached to tickets, with `commit_hash`, `commit_message`, `author_name`, `commit_url`, and `branch`.

---

## 💡 How to Link Git Commits to Tickets

### Method 1: Standard Git Workflow (with Ticket Key)

When making code changes in any repository, simply include the **Ticket Key** in your commit message:

```bash
# Stage your changes
git add .

# Include the ticket key in the message
git commit -m "PLN-105: Add user authentication and dashboard widgets"

# Push to your repository
git push origin main
```

#### Auto-Closing Tickets via Commit
Use `Fixes`, `Closes`, or `Resolves` in your commit message to automatically mark the ticket as **Done (100% progress)**:
```bash
git commit -m "Fixes PLN-105: Resolved API route and finished task"
git push origin main
```

---

### Method 2: Configure GitHub Webhook for Real-Time Sync

To receive live pushes from GitHub:
1. In your GitHub repository, go to **Settings** $\to$ **Webhooks** $\to$ **Add webhook**.
2. **Payload URL**: `http://<your-server-or-tunnel-url>:5000/api/webhooks/github`
3. **Content type**: `application/json`
4. **Events**: Select *"Just the push event"*.
5. Click **Add webhook**.

---

### Method 3: In-App Direct Commit Linking

1. Click on any task card on your board (or click **Edit Task**).
2. Look for the **"Linked Git Commits"** section.
3. Click **"+ Attach Commit"**, enter your commit hash and message, and click **Attach Commit**.
4. The commit will immediately attach to the ticket with author, branch, and GitHub link.

---

### Method 4: Automated Local Git Hook (`post-commit`)

To have every local `git commit` automatically register in Planio without webhooks, create `.git/hooks/post-commit` in your local project repository:

```bash
#!/bin/sh
COMMIT_HASH=$(git log -1 --format="%h")
COMMIT_MSG=$(git log -1 --format="%s")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Extract ticket key (e.g. PLN-105)
TICKET_KEY=$(echo "$COMMIT_MSG" | grep -oE '[A-Z]{2,6}-[0-9]+' | head -n 1)

if [ -n "$TICKET_KEY" ]; then
  curl -s -X POST http://localhost:5000/api/commits \
    -H "Content-Type: application/json" \
    -d "{\"ticketKey\":\"$TICKET_KEY\",\"commitHash\":\"$COMMIT_HASH\",\"commitMessage\":\"$COMMIT_MSG\",\"branch\":\"$BRANCH\"}" > /dev/null
fi
```
Make it executable:
```bash
chmod +x .git/hooks/post-commit
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Healthcheck and database connection status |
| `/api/auth/register` | `POST` | Register a new user (`name`, `email`, `password`, `role`) |
| `/api/auth/login` | `POST` | User login (`email`, `password`) $\to$ returns JWT token & user |
| `/api/auth/me` | `GET` | Get authenticated user profile (requires `Bearer <token>`) |
| `/api/auth/users` | `GET` | Get list of all team members |
| `/api/tasks` | `GET` | Get all tasks and tickets (includes attached commits) |
| `/api/tasks` | `POST` | Create a new task (auto-generates next `ticket_key`) |
| `/api/tasks/:id` | `PUT` | Update task details, status, or progress |
| `/api/tasks/:id` | `DELETE` | Delete a task and its associated commits |
| `/api/commits` | `POST` | Attach a git commit to a ticket |
| `/api/commits/task/:taskId` | `GET` | Get all commits linked to a task |
| `/api/webhooks/github` | `POST` | GitHub push webhook receiver (scans commit messages for ticket keys) |

---

## 👥 Default Demo Accounts

For testing, you can sign in with any of these pre-configured team accounts (Password: `password123`):

| Name | Email | Role |
|---|---|---|
| **Darlene Robertson** | `darlene@planio.dev` | UI/UX Designer |
| **Savannah Nguyen** | `savannah@planio.dev` | Frontend Developer |
| **Leslie Alexander** | `leslie@planio.dev` | Product Manager |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS Design System, Responsive Glassmorphism.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, CORS.
- **Database**: PostgreSQL with `pg` connection pool + resilient fallback adapter.
- **Version Control Integrations**: GitHub REST API v3, Webhook Push Receiver.
