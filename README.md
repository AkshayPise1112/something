# T→G (Trend to Growth)
### Full-Stack Business Intelligence Platform with Groq AI & MongoDB

> **"T→G finds the trends that matter to your business — and tells you what to consider doing next."**

---

## 🌟 The Core Loop
```
DETECT → ANALYZE → MATCH → OPPORTUNITY → ACTION PLAN → EXPERT VALIDATE → EXPERIMENT → MEASURED GROWTH
```

---

## 🏗️ Simplified Architecture (2 Folders)

```
pragyan/
├── frontend/               # React + TypeScript + Vite + Tailwind CSS + Lucide + Recharts
│   ├── src/
│   │   ├── components/     # Layout, Navbar, Sidebar
│   │   ├── pages/          # Landing, Dashboard, Trend Finder, Analytics, Opportunities, etc.
│   │   ├── services/api/   # Central typed API client (supports VITE_API_URL)
│   │   └── types/          # Domain contracts
│   ├── vercel.json         # SPA routing for Vercel deployment
│   └── package.json
│
├── backend/                # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── db/             # MongoDB connection, Mongoose models, auto-seeding
│   │   ├── intelligence/   # Groq AI provider (llama-3.3-70b-versatile) & Mock fallback
│   │   ├── repositories/   # MongoRepository + fallback in-memory store
│   │   ├── routes/         # Standard REST endpoints
│   │   └── server.ts       # Express server entry point
│   ├── .env                # Single backend environment file
│   ├── .env.example
│   └── package.json
│
└── package.json            # Root convenience scripts
```

---

## ⚙️ Backend Configuration (`backend/.env`)

All backend configuration is consolidated into a single file: **`backend/.env`**:

```env
PORT=4000
APP_ENV=development
WEB_ORIGIN=http://localhost:5173

# Database (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/pragyan

# Groq AI (Free, high-speed LLM reasoning)
# Get your free key at https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Authentication
JWT_SECRET=tg-secret-jwt-key-growth-works-2025
```

> **Note:** If `GROQ_API_KEY` is not provided, the system automatically uses its deterministic rule-based Mock Intelligence engine so that the app always stays fully functional.
> If MongoDB is empty or newly created, it automatically seeds initial demo business data on startup.

---

## 🚀 Quick Start Locally

### 1. Run Backend (Port 4000)
```bash
cd backend
npm install
npm run dev
```

### 2. Run Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open your browser to: **`http://localhost:5173`**
