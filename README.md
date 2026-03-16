# TaskFlow — Real-Time Collaborative Project Management Tool

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Real--Time%20Collaboration-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black?style=for-the-badge&logo=socket.io)

> A production-grade Kanban/Scrum hybrid project management tool with real-time collaboration, drag-and-drop boards, and live updates using WebSockets.

## 🚀 Live Demo
- **Frontend**: Coming soon (Vercel)
- **Backend API**: Coming soon (Render)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT authentication with refresh token rotation
- Role-based access control (Admin, Member, Viewer)
- Rate limiting (100 req/15min general, 10 req/15min auth)
- XSS prevention with helmet.js + xss-clean
- Parameterized queries (SQL injection safe)

### 📋 Kanban Board
- Drag-and-drop cards between columns
- Real-time updates via Socket.io
- Priority filters (Urgent, High, Medium, Low)
- Progress bars per column
- Search cards within board
- Add/rename/delete lists

### 🃏 Task Management
- Card details (title, description, priority, due date)
- Checklists with progress tracking
- Comments system
- File attachments (Cloudinary)
- Label system
- Assignee management

### ⚡ Real-Time Collaboration
- Live card movement sync across browsers
- Online user presence indicators
- Real-time notifications bell
- Activity audit trail with timestamps

### 🎨 UI/UX
- Dark/Light mode toggle
- Mobile responsive design
- Loading skeletons
- Empty states
- Keyboard shortcuts (N = new card)
- Toast notifications

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| @hello-pangea/dnd | Drag and drop |
| Zustand | State management |
| Socket.io-client | Real-time communication |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server framework |
| PostgreSQL | Primary database |
| Socket.io | WebSocket server |
| JWT | Authentication |
| Cloudinary | File storage |
| express-rate-limit | Rate limiting |
| helmet + xss-clean | Security |
| bcryptjs | Password hashing |

---

## 🏗️ System Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js 15    │────▶│  Express REST API │────▶│   PostgreSQL    │
│   (Vercel)      │     │  (Render)         │     │   (Neon)        │
│                 │◀────│                   │◀────│                 │
└────────┬────────┘     └────────┬─────────┘     └─────────────────┘
         │                       │
         │    WebSocket          │
         └───────────────────────┘
              Socket.io
```

### Database Schema
```
users ──── workspace_members ──── workspaces
                                       │
                                    boards
                                       │
                                     lists
                                       │
                                     cards
                                    /  |  \
                              comments  checklists  attachments
                                              │
                                        activity_logs
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
# Clone repository
git clone https://github.com/Prince-Chakraborty/taskflow-collaborative-tool.git
cd taskflow-collaborative-tool/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your environment variables

# Run database migrations
psql -U postgres -d your_db -f src/config/schema.sql

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Fill in your environment variables

# Start development server
npm run dev
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=8000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=collaborative_tool_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

---

## 🧪 Testing
```bash
cd backend
npm test
```

---

## 🚀 Deployment

### Database (Neon)
1. Create account at neon.tech
2. Create new project
3. Copy connection string to backend .env

### Backend (Render)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables

### Frontend (Vercel)
1. Import GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

---

## 🔄 Rollback Plan
If deployment fails:
1. Revert to previous commit: `git revert HEAD`
2. Push to GitHub: `git push origin main`
3. Render/Vercel auto-deploys previous version
4. Database: Neon supports point-in-time recovery

---

## 📝 API Documentation

### Auth Endpoints
```
POST /api/auth/signup    — Register new user
POST /api/auth/login     — Login user
POST /api/auth/logout    — Logout user
GET  /api/auth/me        — Get current user
```

### Workspace Endpoints
```
GET    /api/workspaces          — Get all workspaces
POST   /api/workspaces          — Create workspace
GET    /api/workspaces/:id      — Get workspace
PUT    /api/workspaces/:id      — Update workspace
DELETE /api/workspaces/:id      — Delete workspace
```

### Board Endpoints
```
GET    /api/boards/workspace/:id  — Get boards by workspace
POST   /api/boards                — Create board
GET    /api/boards/:id            — Get board with lists & cards
PUT    /api/boards/:id            — Update board
DELETE /api/boards/:id            — Delete board
```

### Card Endpoints
```
POST   /api/cards              — Create card
GET    /api/cards/:id          — Get card details
PUT    /api/cards/:id          — Update card
DELETE /api/cards/:id          — Delete card
PUT    /api/cards/:id/move     — Move card between lists
POST   /api/cards/:id/comments — Add comment
POST   /api/cards/:id/checklist — Add checklist item
```

---

## 👨‍💻 Author
**Prince Chakraborty**
- GitHub: [@Prince-Chakraborty](https://github.com/Prince-Chakraborty)

---

## 📄 License
MIT License — feel free to use this project for learning or inspiration.
