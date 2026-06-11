# KM-BARBER

Appointment booking and management platform for barbershops. Customers discover barbers, select services, and book in real-time. Administrators manage the entire operation through a dashboard.

Built with React, Node.js, Express, and PostgreSQL.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Vite |
| Backend | Node.js, Express 4 (ESM) |
| Database | PostgreSQL 16+ |
| ORM | Prisma 7 with @prisma/adapter-pg |
| Auth | JWT (access + refresh tokens), bcrypt |
| Styling | CSS Custom Properties, no framework |

## Project Structure

```
km-barber/
├── client/                        # React + Vite SPA
│   └── src/
│       ├── api/                   # HTTP client (fetch wrapper, auto-refresh)
│       ├── components/
│       │   ├── layout/            # Navbar, Footer
│       │   └── ui/                # Modal, ThemeToggle
│       ├── context/               # AuthContext, ThemeContext
│       ├── features/              # Feature-based pages
│       │   ├── admin/             # Dashboard, CRUD for barbers/services/reservations
│       │   ├── auth/              # Login, Register
│       │   ├── barbers/           # Barber list, profile with slot picker
│       │   ├── booking/           # Checkout flow
│       │   ├── home/              # Landing page
│       │   └── reservations/      # Customer reservation management
│       └── styles/                # Global CSS with theme system
├── server/                        # Express API (ESM)
│   ├── prisma/
│   │   ├── schema.prisma          # 7 models, 2 enums
│   │   └── seed.js                # Admin + 6 default services
│   ├── prisma.config.ts           # Prisma 7 datasource config
│   └── src/
│       ├── config/                # Environment configuration
│       ├── middleware/            # authenticate, authorize, validate, rateLimiter, errorHandler
│       ├── modules/               # Feature-based modules
│       │   ├── auth/              # Register, login, refresh, profile
│       │   ├── barbers/           # Public listing, detail, slot generation, search suggestions
│       │   ├── services/          # Public service listing
│       │   ├── reservations/      # Create, list, cancel (with double-booking prevention)
│       │   └── admin/             # Dashboard, full CRUD for barbers/services/reservations
│       ├── utils/                 # Logger (file + stdout), response helpers, errors, Prisma client
│       ├── app.js                 # Express app setup
│       └── server.js              # Entry point with graceful shutdown
├── create-admin.js                # Standalone admin provisioning script
├── docker-compose.yml             # PostgreSQL + API containers
├── Dockerfile                     # Multi-stage: build frontend, serve from Node
└── .env.example                   # Environment variable template
```

## Quick Start

### Prerequisites

- Node.js 20+ (including npm)
- PostgreSQL 16+
- A terminal (PowerShell, bash, etc.)

### Setup

```bash
# Clone and enter the project
git clone <repo-url> km-barber
cd km-barber

# 1. Backend dependencies
cd server
npm install

# 2. Configure environment
# Edit server/.env with your PostgreSQL credentials
cp .env .env

# 3. Create the database
# Connect to PostgreSQL and run:
#   CREATE DATABASE km_barber;

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed default data (admin user + services)
npm run seed

# 6. Provision admin account
cd ..
node create-admin.js

# 7. Start the API server
cd server
npm run dev

# 8. In a second terminal — install and start the frontend
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in a browser.

### Default Credentials

**Admin dashboard:** `admin@km-barber.com` / `Admin123456`

**Barber default password:** `barber123` (set at creation, change on first login)

## Scripts

### Server (`server/`)

| Command | Action |
|---------|--------|
| `npm run dev` | Start with file watching (`node --watch`) |
| `npm start` | Production start |
| `npm run seed` | Seed admin + default services |
| `npm run migrate:dev` | Create/apply Prisma migrations |
| `npm run generate` | Regenerate Prisma client |

### Client (`client/`)

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build to `client/dist/` |
| `npm run preview` | Preview production build |

## API

Base URL: `http://localhost:3000/api` (or proxied through Vite at `/api`)

All endpoints return a uniform JSON envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { },
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 },
  "timestamp": "2026-06-11T00:00:00.000Z"
}
```

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Customer registration |
| POST | `/auth/login` | No | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | No | Exchange refresh token for new token pair |
| GET | `/auth/profile` | Bearer | Current user profile |

### Barbers (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/barbers` | Paginated list with optional `?search=&page=&limit=` |
| GET | `/barbers/suggestions?q=` | Autocomplete suggestions (name, username) |
| GET | `/barbers/:id` | Full profile with services, working hours |
| GET | `/barbers/:id/slots?date=&serviceIds=` | Available time slots for selected services |

### Services (public)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/services` | All active services |

### Reservations (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/reservations` | Create booking (transactional conflict check) |
| GET | `/reservations/mine` | Current user's reservations |
| PATCH | `/reservations/:id/cancel` | Cancel own reservation |

### Admin (ADMIN role required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Platform stats, recent reservations, top services |
| GET | `/admin/barbers` | All barbers with details |
| POST | `/admin/barbers` | Create barber (custom pricing per service) |
| PUT | `/admin/barbers/:id` | Update barber profile, services, hours |
| GET | `/admin/barbers/:id` | Single barber with details |
| PATCH | `/admin/barbers/:id/toggle` | Enable/disable barber |
| GET | `/admin/services` | All services |
| POST | `/admin/services` | Create service |
| PUT | `/admin/services/:id` | Update service |
| GET | `/admin/reservations?page=&limit=` | All reservations (paginated) |

## Deployment

### Docker

```bash
# Edit DATABASE_URL in docker-compose.yml if needed
# Then:
docker-compose up -d

# The API will be available at http://localhost:3000
# The frontend is served by the API server in production mode
```

### Bare Metal

```bash
# Build frontend
cd client && npm run build

# The built assets are in client/dist/
# Serve them with the Express server in production:
cd server && NODE_ENV=production node server.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | API server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | — | JWT signing key for access tokens |
| `JWT_REFRESH_SECRET` | — | JWT signing key for refresh tokens |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token lifetime |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logger verbosity (error/warn/info/debug) |

## Architecture Notes

- **Double-booking prevention**: Reservation creation runs inside a Prisma `$transaction`. Conflicting time ranges are detected and rejected atomically within the same transaction boundary.
- **Slot generation**: Not stored. Computed server-side in real-time from working hours, selected service cumulative duration, and existing reservations. Default slot interval is 30 minutes.
- **Token lifecycle**: Access tokens expire after 15 minutes. The client refreshes them silently 5 minutes before expiry using the refresh token. If the refresh fails, the user is redirected to login.
- **Custom pricing**: Each barber can override the standard price and duration of a service at the `BarberService` junction level. Falls back to the service defaults when not set.
- **Logging**: Logs are written to both stdout/stderr and `server/logs/` (rotated manually).
- **Rate limiting**: General limiter at 100 req/15min, auth-specific limiter at 30 req/15min.
