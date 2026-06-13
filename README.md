# KM-BARBER  [![Live Demo](https://img.shields.io/badge/demo-live-22c55e?style=for-the-badge&logo=railway)](https://saas-barberbro-production.up.railway.app/)

> Premium barbershop appointment booking & management platform

[![Express](https://img.shields.io/badge/express-4.21-000?style=flat&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/react-18.3-61dafb?style=flat&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/prisma-7-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-4169e1?style=flat&logo=postgresql)](https://www.postgresql.org/)

---

## Overview

KM-BARBER is a full-stack barbershop ecosystem that connects customers, barbers, and administrators through a unified platform. Customers can browse barbers, explore services with real-time pricing, and book appointments with instant availability checks — all powered by a robust RESTful API ( **23 endpoints** ) and a responsive React SPA.

| Portal | Purpose |
|--------|---------|
| **Customer** | Browse barbers, services, book & manage reservations |
| **Admin** | Dashboard analytics, full CRUD for barbers/services/reservations |
| **API** | RESTful JSON API consumed by the frontend or any third-party client |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, Vite 5, Framer Motion 12 |
| **Backend** | Node.js, Express 4 (ESM), Helmet, Compression, Cookie Parser |
| **Database** | PostgreSQL 16+ |
| **ORM** | Prisma 7 with `@prisma/adapter-pg` |
| **Auth** | JWT (dual access/refresh token), bcrypt, rate-limited |
| **Validation** | Custom middleware + Joi-inspired schema validation |
| **Logging** | Structured logger (file + stdout, multi-level) |
| **Deployment** | Docker / Docker Compose, Railway-ready |

---

## Architecture

```
km-barber/
├── client/                          # React SPA (Vite)
│   └── src/
│       ├── api/                     # HTTP client (fetch wrapper, auto token refresh)
│       ├── components/              # Shared UI — layout, modals, theme
│       ├── context/                 # AuthContext, ThemeContext
│       ├── features/                # Feature-scoped pages
│       │   ├── admin/               # Dashboard, CRUD for barbers/services/reservations
│       │   ├── auth/                # Login, register
│       │   ├── barbers/             # Barber listing, detail, slot picker
│       │   ├── booking/             # Checkout flow
│       │   ├── home/                # Landing page
│       │   └── reservations/        # Customer reservation management
│       └── styles/                  # Global CSS custom properties, theme system
├── server/                          # Express API (ESM)
│   ├── prisma/
│   │   ├── schema.prisma            # 7 models · 2 enums · 4 indexes
│   │   └── seed.js                  # Admin + 6 default services
│   └── src/
│       ├── config/                  # Environment config (dotenv)
│       ├── middleware/               # authenticate · authorize · validate · rateLimiter · errorHandler
│       ├── modules/                  # Feature modules
│       │   ├── auth/                # Register, login, refresh, profile
│       │   ├── barbers/             # Public listing, detail, slot generation, search suggestions
│       │   ├── services/            # Service catalog
│       │   ├── reservations/        # Create, list, cancel (double-booking safe)
│       │   └── admin/               # Dashboard + full CRUD
│       └── utils/                   # Logger, response helpers, custom errors, Prisma client
├── create-admin.js                  # Admin provisioning script
├── docker-compose.yml               # PostgreSQL + API
├── Dockerfile                       # Multi-stage build
└── .env.example
```

---

## API Endpoints

Base URL: `http://localhost:3000/api` (proxied through Vite at `/api` in development)

All endpoints return a uniform JSON envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 },
  "timestamp": "2026-06-11T00:00:00.000Z"
}
```

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check (uptime, environment) |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Customer registration |
| POST | `/api/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/api/auth/refresh` | — | Exchange refresh token for new token pair |
| GET | `/api/auth/profile` | Bearer | Current user profile |

### Barbers (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/barbers` | Paginated list (`?search=&page=&limit=`) |
| GET | `/api/barbers/suggestions?q=` | Autocomplete suggestions |
| GET | `/api/barbers/:id` | Full profile with services, working hours |
| GET | `/api/barbers/:id/slots?date=&serviceIds=` | Available time slots |

### Services (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | All active services |

### Reservations (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reservations` | Create booking (transactional conflict check) |
| GET | `/api/reservations/mine` | Current user's reservations |
| PATCH | `/api/reservations/:id/cancel` | Cancel own reservation |

### Admin (`ADMIN` role required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Platform stats, recent reservations, top services |
| GET | `/api/admin/barbers` | All barbers with details |
| POST | `/api/admin/barbers` | Create barber (custom pricing per service) |
| GET | `/api/admin/barbers/:id` | Single barber with details |
| PUT | `/api/admin/barbers/:id` | Update barber profile, services, hours |
| PATCH | `/api/admin/barbers/:id/toggle` | Enable / disable barber |
| GET | `/api/admin/services` | All services |
| POST | `/api/admin/services` | Create service |
| PUT | `/api/admin/services/:id` | Update service |
| GET | `/api/admin/reservations?page=&limit=` | All reservations (paginated) |

**Total: 23 RESTful endpoints**

---

## Data Model

| Model | Description |
|-------|-------------|
| **User** | Authentication & role-based access (ADMIN / BARBER / CUSTOMER) |
| **Barber** | Barber profile with contact, hours, active status |
| **Service** | Service catalog (name, description, base price, duration) |
| **BarberService** | Junction with optional per-barber price/duration override |
| **Reservation** | Booking record with time window, total price/duration, status |
| **ReservationService** | Line items for each service in a reservation |
| **WorkingHours** | Weekly schedule per barber (day, start, end, active) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

### Local Setup

```bash
# 1. Install backend dependencies
cd server && npm install

# 2. Configure environment
cp .env.example .env
# Edit server/.env with your PostgreSQL credentials

# 3. Create the database
psql -U postgres -c "CREATE DATABASE km_barber;"

# 4. Run migrations & seed
npx prisma migrate dev --name init
npm run seed

# 5. Provision an admin account
cd .. && node create-admin.js

# 6. Start the API server
cd server && npm run dev

# 7. In a new terminal — install & start the frontend
cd client && npm install && npm run dev
```

Open `http://localhost:5173` in your browser.

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@km-barber.com` | `Admin123456` |
| **Barber** | set at creation | `barber123` |

---

## Scripts

### Server (`server/`)

| Command | Action |
|---------|--------|
| `npm run dev` | Start with file watching (`node --watch`) |
| `npm start` | Production start |
| `npm run seed` | Seed admin + default services |
| `npm run migrate:dev` | Create / apply Prisma migrations |
| `npm run generate` | Regenerate Prisma client |

### Client (`client/`)

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build to `client/dist/` |
| `npm run preview` | Preview production build |

---

## Deployment

### Docker

```bash
docker-compose up -d
# API → http://localhost:3000
```

### Bare Metal

```bash
cd client && npm run build
cd ../server && NODE_ENV=production node server.js
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | API server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | — | JWT signing key for access tokens |
| `JWT_REFRESH_SECRET` | — | JWT signing key for refresh tokens |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logger verbosity (`error` / `warn` / `info` / `debug`) |

---

## Architecture Highlights

### Double-Booking Prevention
Reservation creation runs inside a Prisma `$transaction`. Conflicting time ranges are detected and rejected atomically within a single transaction boundary — no race conditions.

### Slot Generation
Slots are computed server-side in real-time from working hours, selected service cumulative duration, and existing reservations — no stale pre-generated data.

### Token Lifecycle
Access tokens expire after 15 minutes. The client silently refreshes them 5 minutes before expiry using the refresh token. On refresh failure, the user is redirected to login.

### Custom Barbershop Pricing
Each barber can override the standard price and duration of a service at the `BarberService` junction level. Falls back to service defaults when not set.

### Security
- Helmet for HTTP headers
- Rate limiting: 100 req/15min general, 30 req/15min for auth routes
- Input validation on all mutation endpoints
- JWT with dual token pattern
- bcrypt password hashing

---

## License

MIT
