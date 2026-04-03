# ProjectFlow 🚀

A sleek, professional project management tool built with React, Node.js, Express, and MongoDB.

---

## Tech Stack

- **Frontend**: React 18, React Router v6, react-hot-toast, lucide-react, date-fns, axios
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB

---


## Repo
-- **TEch**: frotend
## Prerequisites

Make sure you have these installed:
- **Node.js** (v16 or higher) — https://nodejs.org
- **npm** (comes with Node.js)
- **MongoDB** (local or MongoDB Atlas) — https://www.mongodb.com/try/download/community

---

## Installation & Setup

### Step 1 — Clone or unzip the project

```bash
cd projectflow
```

### Step 2 — Install root dependencies (concurrently)

```bash
npm install
```

### Step 3 — Install server dependencies

```bash
cd server
npm install
```

### Step 4 — Install client dependencies

```bash
cd ../client
npm install
```

### Step 5 — Configure environment variables

In the `server/` directory, create a `.env` file:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectflow
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

> If using MongoDB Atlas, replace `MONGODB_URI` with your connection string.

### Step 6 — Start MongoDB (if running locally)

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows — open Services and start MongoDB
# Or run:
mongod

# Ubuntu/Linux
sudo systemctl start mongod
```

---

## Running the App

### Option A — Run both servers simultaneously (recommended)

From the root `/projectflow` directory:

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### Option B — Run separately

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

---

## Package Summary

### Root
| Package | Purpose |
|---------|---------|
| `concurrently` | Run both servers with one command |

### Server (`/server`)
| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT authentication |
| `bcryptjs` | Password hashing |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Environment variables |
| `nodemon` | Auto-restart on file changes (dev) |

### Client (`/client`)
| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI library |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `date-fns` | Date formatting/manipulation |
| `react-scripts` | CRA build tooling |

---

## Features

- 🔐 **Authentication** — Register/Login with JWT tokens
- 📁 **Projects** — Create, manage, delete projects with color coding
- ✅ **Tasks** — Kanban board (To Do → In Progress → Review → Done)
- 📋 **My Tasks** — View all tasks assigned to you, grouped by status
- 📊 **Dashboard** — Stats overview with progress tracking
- 📅 **Deadlines** — Set deadlines, see overdue items highlighted
- 👥 **Members** — Assign tasks to project members
- 🏷️ **Tags** — Label projects and tasks for easy filtering

---

## Folder Structure

```
projectflow/
├── server/
│   ├── index.js          # Entry point
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js       # JWT verification
│   └── .env
│
└── client/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── App.css         # Global styles
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Projects.js
            ├── ProjectDetail.js
            └── MyTasks.js
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Projects
- `GET /api/projects` — List all your projects
- `GET /api/projects/:id` — Get project details
- `POST /api/projects` — Create project
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project

### Tasks
- `GET /api/tasks/project/:projectId` — Tasks in a project
- `GET /api/tasks/my-tasks` — Tasks assigned to me
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

---

## Troubleshooting

**MongoDB connection refused** — Make sure MongoDB is running locally, or update `MONGODB_URI` in `.env` with your Atlas connection string.

**Port 5000 in use** — Change `PORT` in `.env` to another value (e.g. 5001).

**CORS errors** — Make sure the frontend proxy in `client/package.json` matches your server port.

**npm install fails** — Try deleting `node_modules` and `package-lock.json` then re-running `npm install`.
