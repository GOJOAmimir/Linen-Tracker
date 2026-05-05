# Linen Tracking System

A full-stack web application for hospital linen management built with **React + TypeScript** (frontend) and **Express + MySQL** (backend). It enables real-time tracking of hospital linens through RFID-based batch workflows—from laundry processing and storage to delivery and loss detection.

---

## Features

### Dashboard & Analytics
- **Real-time status cards** — live counts for linen statuses: *Dipakai* (In Use), *Diproses* (Processing), *Bersih* (Clean), *Intransit*, and *Hilang* (Missing)
- **Batch summary** — overview of the latest batch-in and batch-out operations
- **Daily linen chart** — 7-day trend of incoming linens (Chart.js)
- **Top wash cycles** — linens closest to their maximum wash cycle limit

### Batch Management
- **Batch Information** — real-time view of the current/latest batch with linen details
- **Finished Batch History** — browse and drill into completed batch-out records
- **Registered Batch History** — browse and drill into batch-in registration records
- **PDF Reports** — generate downloadable batch reports via pdfmake

### Inventory & Storage
- **Inventory Overview** — storage vs on-the-way summary counts
- **Storage Breakdown** — per-type grouped inventory with daily intake stats
- **Storage Detail** — drill into individual linen items by type
- **Storage & On-Way Logs** — full historical movement logs

### Master Data
- **Master Linen** — complete registry of all linens with dimensions, material, supplier, budget source, max cycle, and current wash count
- **Room Management** — room/area assignment tracking
- **Missing Linen Tracking** — linens flagged as lost with elapsed-time tracking

### System Features
- **JWT Authentication** — role-based access (admin / user) with auto-expiry
- **Dark / Light Theme** — persisted in `localStorage` with FOUC-free initial load
- **Real-time Updates** — WebSocket connection for live status push
- **Responsive Design** — collapsible sidebar with mobile overlay and adaptive layout
- **Notification System** — in-app bell notifications with read/unread state

---

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│                         Client                            │
│  React 19 · TypeScript · Tailwind CSS 4 · Vite 6         │
│  react-router-dom · Chart.js · pdfmake · TanStack Table  │
└──────────────────────────┬────────────────────────────────┘
                           │ HTTP (REST) + WebSocket
┌──────────────────────────▼────────────────────────────────┐
│                      API Server                           │
│  Express 5 · Node 20 · JWT · bcrypt · mysql2              │
│  Serves SPA in production (static + SPA fallback)         │
└──────────────────────────┬────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MySQL DB  │
                    │  (SSL/TLS)  │
                    └─────────────┘
```

The app uses a **monorepo-style layout** where the backend lives inside `linen-tracker-api/` and the frontend is at the project root. In production, a multi-stage Docker build compiles the frontend and serves it from the Express API as static files.

---

## Project Structure

```
linen-tracker/
├── src/                          # Frontend source (React + TypeScript)
│   ├── components/               # Reusable UI components
│   │   ├── Sidebar.tsx           # Collapsible sidebar navigation
│   │   ├── Navbar.tsx            # Top navigation bar
│   │   ├── Notification.tsx      # Bell notification dropdown
│   │   ├── StatusSummary.tsx     # Dashboard status cards
│   │   ├── BatchSummary.tsx      # Latest batch overview widget
│   │   ├── LinenByDay.tsx        # 7-day linen chart
│   │   ├── TopCycle.tsx          # Top wash-cycle table
│   │   ├── ProtectedRoute.tsx    # JWT route guard with auto-expiry
│   │   ├── auth.ts               # Token decode helpers
│   │   └── ui/                   # shadcn/ui primitives
│   ├── context/
│   │   └── ThemeContext.tsx       # Dark/light theme provider
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── LoginPage.tsx         # Authentication page
│   │   ├── MasterLinen.tsx       # Linen master data table
│   │   ├── Ruangan.tsx           # Room management
│   │   ├── BatchSelesai.tsx      # Current batch info page
│   │   ├── RiwayatSelesai.tsx    # Finished batch history
│   │   ├── RiwayatRegister.tsx   # Registered batch history
│   │   ├── RiwayatLinenHilang.tsx# Missing linen report
│   │   ├── InventoryPage.tsx     # Inventory overview
│   │   ├── StoragePage.tsx       # Storage by type
│   │   ├── StorageDetailPage.tsx # Storage type detail
│   │   ├── StorageLog.tsx        # Storage movement log
│   │   ├── OnWayPage.tsx         # On-the-way items
│   │   └── OnWayLog.tsx          # On-the-way movement log
│   ├── types/
│   │   └── pdfmake.d.ts          # pdfmake type declarations
│   ├── App.tsx                   # Root app with routes & WebSocket
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
├── linen-tracker-api/            # Backend source (Express + Node)
│   ├── controllers/
│   │   ├── DashboardController.js    # Status summary aggregation
│   │   ├── HilangController.js       # Missing linen queries
│   │   ├── InventoryController.js    # Storage & on-way CRUD
│   │   ├── LatestBatchController.js  # Latest batch data
│   │   ├── LinenMasterController.js  # Linen master data
│   │   └── loginController.js        # JWT auth with bcrypt
│   ├── routes/
│   │   ├── rDashboard.js
│   │   ├── rHilang.js
│   │   ├── rInventory.js
│   │   ├── rLatestBatch.js
│   │   ├── rMasterLinen.js
│   │   └── rlogin.js
│   ├── db.js                     # MySQL connection pool
│   ├── index.js                  # Express server entry point
│   └── package.json
├── deploy/                       # Production deployment configs
│   ├── docker-compose.yml
│   └── .env.example
├── Dockerfile                    # Multi-stage build (frontend + API)
├── .gitlab-ci.yml                # CI/CD pipeline (test → build → deploy)
├── .env.example                  # Frontend env template
├── index.html                    # Vite HTML entry
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

| Tool       | Version  |
|------------|----------|
| Node.js    | ≥ 20 LTS |
| npm        | ≥ 9       |
| MySQL      | ≥ 8.0    |

### 1. Clone the repository

```bash
git clone <repository-url>
cd linen-tracker
```

### 2. Set up environment variables

**Frontend** — copy and edit the root `.env.example`:

```bash
cp .env.example .env
```

```env
# Frontend (Vite) — prefix with VITE_ to expose to the browser
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:3001
```

**Backend** — copy and edit the API `.env.example`:

```bash
cp linen-tracker-api/.env.example linen-tracker-api/.env
```

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name

# App
PORT=8080
JWT_SECRET=your_jwt_secret

# CORS — comma-separated allowed origins
CORS_ORIGIN=http://localhost:5173
```

### 3. Install dependencies

```bash
# Frontend
npm install

# Backend
cd linen-tracker-api
npm install
cd ..
```

### 4. Start development servers

```bash
# Terminal 1 — Frontend (Vite dev server on :5173)
npm run dev

# Terminal 2 — Backend (Express API on :8080)
cd linen-tracker-api
npm start
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:8080`.

---

## Docker

### Build the production image

The Dockerfile uses a **multi-stage build**:
1. **Stage 1** — Installs frontend dependencies, builds the React app with Vite
2. **Stage 2** — Installs API production dependencies, copies the built frontend into the Express static path

```bash
docker build \
  --build-arg VITE_API_URL="" \
  --build-arg VITE_WS_URL="ws://your-server:3001" \
  -t linen-tracker:latest .
```

> Setting `VITE_API_URL=""` makes the frontend use relative URLs (same-origin), which works when Express serves both the API and the SPA.

### Run with Docker Compose

A production-ready compose file is provided in `deploy/`:

```bash
cd deploy
cp .env.example .env
# Edit .env with your production database credentials

docker compose up -d
```

```yaml
# deploy/docker-compose.yml
services:
  linen-tracker:
    image: gitlab.lan:5050/simtechdev/linen-tracker:latest
    container_name: linen-tracker
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env
```

---

## CI/CD Pipeline

The project includes a `.gitlab-ci.yml` with three stages:

| Stage    | Description                                                      | Trigger         |
|----------|------------------------------------------------------------------|-----------------|
| `test`   | Install dependencies and verify the build compiles successfully  | `main` branch & MRs |
| `build`  | Build Docker image and push to GitLab Container Registry         | `main` branch   |
| `deploy` | SSH into the production server, pull latest image, restart stack | `main` branch   |

### Pipeline flow

```
push to main → test → build Docker image → push to registry → SSH deploy → docker compose up
```

### Required CI/CD Variables

| Variable            | Description                            |
|---------------------|----------------------------------------|
| `CI_REGISTRY_*`     | GitLab Container Registry credentials (automatic) |
| `VITE_WS_URL`       | WebSocket URL baked into the frontend build       |
| `DEPLOY_KEY`        | SSH private key (ed25519) for deployment server   |
| `DEPLOY_HOST`       | Target server hostname/IP                         |
| `DEPLOY_USER`       | SSH user on the deployment server                 |

---

## API Reference

All API endpoints are served from the Express backend on the configured `PORT` (default: `8080`).

### Authentication

| Method | Endpoint   | Description                    | Auth |
|--------|------------|--------------------------------|------|
| POST   | `/login`   | Authenticate and receive a JWT | ❌   |

**Request body:**
```json
{ "username": "string", "password": "string" }
```

**Response:**
```json
{ "success": true, "token": "eyJhbGci..." }
```

### Dashboard

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/dashboard`          | Aggregated status summary counts         |
| GET    | `/linen/top-cycles`   | Top 5 linens by wash cycle count         |
| GET    | `/linen/daily-in`     | Last 7 days of daily linen intake        |

### Batch Operations

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/batches/latest`                     | Latest batch information           |
| GET    | `/batch-status`                       | All batches with IN PROGRESS/FINISHED status |
| GET    | `/batch-list/registered`              | List of all batch-in records       |
| GET    | `/batch-list/finished`                | List of all batch-out records      |
| GET    | `/batch-report/registered/:batchInId` | Detailed report for a batch-in     |
| GET    | `/batch-report/finished/:batchOutId`  | Detailed report for a batch-out    |

### Inventory

| Method | Endpoint                     | Description                            |
|--------|------------------------------|----------------------------------------|
| GET    | `/inventory/summary`         | Storage + on-the-way totals            |
| GET    | `/inventory/storage`         | Storage breakdown by linen type        |
| GET    | `/inventory/storage/:tipe`   | Items in storage for a specific type   |
| GET    | `/inventory/storage_out`     | Currently on-the-way items             |
| GET    | `/inventory/storage_keep_log`| Storage-in movement history            |
| GET    | `/inventory/storage_out_log` | Storage-out movement history           |

### Master Data

| Method | Endpoint         | Description                    |
|--------|------------------|--------------------------------|
| GET    | `/master-linen`  | Full linen master data list    |
| GET    | `/api/missing`   | Linens flagged as lost/missing |

---

## Tech Stack

### Frontend
| Technology         | Purpose                          |
|--------------------|----------------------------------|
| React 19           | UI framework                     |
| TypeScript 5.8     | Type safety                      |
| Vite 6             | Build tool & dev server          |
| Tailwind CSS 4     | Utility-first styling            |
| React Router 7     | Client-side routing              |
| TanStack Table 8   | Advanced data table              |
| Chart.js 4         | Data visualization               |
| pdfmake            | Client-side PDF generation       |
| Axios              | HTTP client                      |
| Headless UI        | Accessible UI primitives         |
| Lucide + React Icons | Iconography                   |

### Backend
| Technology       | Purpose                            |
|------------------|------------------------------------|
| Express 5        | HTTP server & REST API             |
| Node.js 20       | Runtime                            |
| MySQL 8 (mysql2) | Relational database (async/await)  |
| JSON Web Token   | Stateless authentication           |
| bcrypt           | Password hashing                   |
| ws               | WebSocket server                   |
| dotenv           | Environment configuration          |

### DevOps
| Technology         | Purpose                          |
|--------------------|----------------------------------|
| Docker             | Containerization (multi-stage)   |
| Docker Compose     | Orchestration                    |
| GitLab CI/CD       | Automated test, build & deploy   |

---

## Theme System

The app supports **light** and **dark** themes:

- Theme preference is stored in `localStorage` under the key `theme`
- A blocking `<script>` in `index.html` applies the theme class *before* React hydrates (preventing FOUC)
- The `ThemeContext` provider exposes `theme`, `setTheme()`, and `toggleTheme()` hooks
- All components use Tailwind's `dark:` variant for conditional styling

---

## Authentication Flow

1. User submits credentials on `/login`
2. Backend validates against `users_shinka` table using **bcrypt**
3. On success, a **JWT** is issued with `{ username, role }` and a **1-hour expiry**
4. Token is stored in `localStorage` and attached to API requests
5. `ProtectedRoute` component:
   - Decodes the JWT on each render to check validity
   - Automatically redirects to `/login` on expiry
   - Sets a `setTimeout` to force-logout when the token expires while the session is active

### Role-Based Navigation

- **`admin`** — full access to all pages (history, master data, inventory, rooms)
- **`user`** — limited to Dashboard and Batch Information

---

## Available Scripts

### Frontend (`/`)

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start Vite dev server (`--host`)|
| `npm run build`   | Type-check + production build   |
| `npm run lint`    | Run ESLint                      |
| `npm run preview` | Preview production build        |

### Backend (`/linen-tracker-api`)

| Command       | Description            |
|---------------|------------------------|
| `npm start`   | Start the Express API 
