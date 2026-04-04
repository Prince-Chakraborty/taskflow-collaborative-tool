# TaskFlow — Real-Time Collaborative Project Management Tool

![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=flat-square&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black?style=flat-square&logo=socket.io)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=flat-square&logo=docker)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-orange?style=flat-square&logo=githubactions)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> A production-grade, real-time collaborative project management tool offering near-instant task synchronization, live presence indicators, version-based conflict detection, and optimistic drag-and-drop for remote teams — engineered to Jira/Trello standards.

---

## 🚀 Live Demo

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://taskflow-frontend-2026.vercel.app | ✅ Live |
| **Backend API** | https://taskflow-collaborative-tool.onrender.com/api | ✅ Live |
| **Health Check** | https://taskflow-collaborative-tool.onrender.com/api/health | ✅ Live |
| **GitHub** | https://github.com/Prince-Chakraborty/taskflow-collaborative-tool | ✅ Public |

---

## 🎯 The Problem & Solution

**Problem:** Traditional project management tools lack fluid real-time collaboration — teams are forced to manually refresh to see updates, leading to slow workflows, missed changes, data conflicts, and poor team visibility.

**Solution:** TaskFlow enables team members to create, assign, move, and comment on tasks simultaneously, with changes propagating across all connected clients in **under 100ms** — without a single page refresh. Version-based conflict detection ensures no data is lost when two users edit the same card concurrently.

---

## ⚡ Key Engineering Highlights

### Real-Time Synchronization
Architected a **bidirectional WebSocket layer using Socket.io** with isolated board and workspace rooms — ensuring User A's drag-and-drop is instantly reflected on User B's screen without polling or page refresh.

### Optimistic UI with Auto-Revert
Engineered **optimistic UI updates** for drag-and-drop — the UI responds instantly on user action, with **automatic revert** if the server fails. Zero data loss, zero page reloads.

### Version-Based Conflict Detection
Implemented **server-side version checking** on card updates — if two users edit the same card concurrently, the server detects the version mismatch and rejects the stale update, preventing data conflicts.

### Role-Based Access Control (RBAC)
Implemented **JWT authentication with refresh token rotation** and granular RBAC — admins can delete workspaces and manage members, while members can only manage their assigned tasks.

### Database Performance
Optimized PostgreSQL with **7 strategic indexes** on high-frequency query columns (board_id, list_id, workspace_id) — reducing Kanban board load time under concurrent user load.

### Socket.io Room Isolation
Engineered **Socket.io rooms per board and workspace** — users in Workspace A never receive socket events from Workspace B, ensuring both security and bandwidth efficiency.

### Production-Grade Security
Implemented **Helmet.js, XSS protection, and express-rate-limiter** (100 req/15min general, 10 req/15min auth) with all secrets secured via environment variables.

---

## 🏗️ System Architecture
```
┌─────────────────────┐        HTTPS / WSS         ┌──────────────────────┐
│    Next.js 15       │ ◄────────────────────────► │   Express.js API     │
│    (Vercel)         │                             │   (Render)           │
│                     │                             │                      │
│  Zustand Store      │    Socket.io Rooms          │   Socket.io Server   │
│  React Query        │ ◄────────────────────────► │   (board:id rooms)   │
│  @hello-pangea/dnd  │                             │          │           │
└─────────────────────┘                             │   PostgreSQL + 7     │
                                                    │   Indexes (Neon)     │
                                                    │          │           │
                                                    │   Cloudinary CDN     │
                                                    │   (File Uploads)     │
                                                    └──────────────────────┘
```

**Why this architecture?**
- **WebSockets over HTTP polling** — bidirectional, <100ms updates vs 1-3s polling delay
- **PostgreSQL over NoSQL** — ACID compliance + version-based conflict detection for data integrity
- **Zustand over Redux** — lightweight, boilerplate-free state management ideal for real-time UI sync
- **Neon over self-hosted DB** — serverless PostgreSQL with auto-scaling for production reliability

---

## ✨ Features

### 🔐 Authentication & Security
- JWT signup/login with **refresh token rotation**
- **RBAC** — Admin vs Member granular permissions
- Rate limiting, XSS protection, Helmet security headers

### 🗂️ Real-Time Kanban Board
- **Drag & drop** with optimistic updates — zero perceived latency
- **Auto-revert** on server failure — no data loss
- **Version-based conflict detection** — prevents stale concurrent edits
- Multiple lists per board (To Do, In Progress, Done + custom)

### ⚡ Real-Time Collaboration
- **<100ms** task updates across all connected clients
- **Live presence** — see who is currently viewing the board
- **Real-time notifications** — instant alerts for card moves and comments
- **Activity feed** — full audit trail of all board actions

### 💬 Team Communication
- Card comments with **@mention** support
- Checklists and subtasks inside cards
- File attachments via **Cloudinary CDN**

### 🔍 Productivity Tools
- **Full-text search** with pagination across all cards
- **Advanced filters** — by priority, assignee, due date
- **Due date tracking** — overdue detection with warning banners
- **Dark/Light mode** — system-aware theme switching
- Settings — profile update, password change, notification preferences

---

## 🛠️ Tech Stack

| Layer | Technology | Why Chosen |
|-------|-----------|------------|
| Frontend | Next.js 15 + TypeScript | SSR, App Router, full type safety |
| Styling | Tailwind CSS v4 | Utility-first, rapid UI development |
| State | Zustand | Lightweight, real-time friendly |
| Server State | React Query (@tanstack) | Efficient server data caching |
| Drag & Drop | @hello-pangea/dnd | Production-grade DnD |
| Real-Time | Socket.io Client/Server | Bidirectional WebSocket rooms |
| Backend | Node.js + Express | High-performance REST API |
| Database | PostgreSQL + Neon | ACID compliance, serverless cloud |
| Auth | JWT + Refresh Tokens | Stateless, secure session management |
| File Upload | Cloudinary | CDN-backed media storage |
| Containerization | Docker | Consistent dev/prod environments |
| CI/CD | GitHub Actions | Automated test + lint on every push |
| Logging | Winston | Structured production logging |
| Security | Helmet + XSS + Rate Limit | Production security hardening |

---

## 📊 Performance & Scale

- ⚡ **<100ms** WebSocket event propagation across all connected clients
- 🗄️ **7 PostgreSQL indexes** on high-frequency columns for fast board load
- 🔒 **Rate limiting** — 100 req/15min general, 10 req/15min auth
- 📦 **Optimistic UI** — zero perceived latency on drag-and-drop with auto-revert
- 🏠 **Socket.io room isolation** — per board and workspace for security + efficiency
- 🔄 **Version-based conflict detection** — prevents stale concurrent card edits
- 👥 **Handles 50+ concurrent users** per workspace

---

## 🧪 Testing & Quality

- ✅ **19 Unit Tests** — API endpoint and controller coverage (Jest)
- ✅ **Cypress E2E Tests** — Full user flow automation
- ✅ **GitHub Actions CI/CD** — Automated test + lint on every push to main
- ✅ **Postman Collection** — Complete API documentation
- ✅ **40 Requirements RTM** — Full traceability matrix
- ✅ **22 Bug Tracking Log** — Documented and resolved

---

## 🚀 Run Locally

### With Docker (Recommended)
```bash
# 1. Clone the repo
git clone https://github.com/Prince-Chakraborty/taskflow-collaborative-tool.git
cd taskflow-collaborative-tool

# 2. Copy env file and fill in your values
cp .env.example .env

# 3. Run all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Manual Setup
```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=8000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## 📁 Project Structure
```
taskflow/
├── frontend/
│   ├── app/
│   │   ├── (auth)/            # Login, Signup, Forgot Password
│   │   └── (dashboard)/       # Board, Workspace, Settings
│   ├── components/
│   │   ├── board/             # Kanban board, drag-and-drop
│   │   ├── card/              # Card modal, comments, checklist
│   │   └── layout/            # Navbar, Sidebar
│   ├── store/                 # Zustand state management
│   ├── hooks/                 # useAuth, useSocket, custom hooks
│   └── lib/                   # API client, Socket config
├── backend/
│   └── src/
│       ├── controllers/       # Business logic + version conflict detection
│       ├── routes/            # API route definitions
│       ├── middleware/        # Auth, validation, error handling
│       ├── socket/            # Socket.io room event handlers
│       ├── config/            # DB config, schema, 7 indexes
│       └── utils/             # Winston logger
├── .github/workflows/         # CI/CD — test + lint pipeline
├── docker-compose.yml         # Production container setup
└── docker-compose.dev.yml     # Development DB port override
```

---

## 🎓 Lessons Learned & Future Scope

### Engineering Challenges & Solutions

| Challenge | Solution | Result |
|-----------|----------|--------|
| Drag-and-drop felt slow waiting for server | Optimistic UI with auto-revert | Instant perceived response |
| Two users editing same card simultaneously | Version-based conflict detection | No data loss on concurrent edits |
| Socket events leaking across workspaces | Room-based Socket.io isolation | Security + bandwidth efficiency |
| Slow board load with many cards | 7 PostgreSQL indexes on join columns | Faster query performance |
| JWT expiry mid-session | Refresh token rotation | Seamless user experience |

### Future Improvements
- 🤖 **AI Task Summarization** — Gemini API for auto-generating task descriptions
- 📊 **Analytics Dashboard** — Team productivity metrics and burndown charts
- 📧 **Email Notifications** — SendGrid integration for digest emails
- 📱 **Mobile App** — React Native companion app
- 🔄 **Offline Support** — Service Worker + sync queue for offline-first experience

---

## 👨‍💻 Author

**Prince Chakraborty**
- GitHub: [@Prince-Chakraborty](https://github.com/Prince-Chakraborty)
- Live: [taskflow-frontend-2026.vercel.app](https://taskflow-frontend-2026.vercel.app)

---

## 📄 License

MIT License

---

<p align="center">Engineered with ❤️ for real-world collaborative teams</p>
