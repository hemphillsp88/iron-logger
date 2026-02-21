# Iron Log — Beginner Full-Body Workout Tracker

A single-page workout tracker with a Postgres backend via Netlify DB (powered by Neon).

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Netlify + Database

```bash
# Link to your Netlify site (or create one)
npx netlify link
# — or —
npx netlify init

# Provision the Neon Postgres database
npx netlify db init
```

This creates your database and sets the `NETLIFY_DATABASE_URL` environment variable automatically.

> **Important:** After provisioning, go to your Netlify dashboard → Extensions → Neon → **Claim database** to keep it beyond the 7-day trial.

### 3. Run locally

```bash
npx netlify dev
```

Open `http://localhost:8888`. The database tables will auto-create on first visit.

### 4. Deploy

```bash
npx netlify deploy --prod
```

Or connect a Git repo and push — Netlify will build and deploy automatically.

---

## Project Structure

```
ironlog/
├── public/
│   └── index.html          # Frontend (single-file app)
├── netlify/
│   └── functions/
│       ├── workouts.mjs     # CRUD for workout sessions
│       ├── weights.mjs      # CRUD for weight entries
│       └── migrate.mjs      # Creates DB tables on first call
├── db-migrate.mjs           # CLI migration script (optional)
├── netlify.toml              # Netlify config
├── package.json
└── README.md
```

## Database Schema

### `workouts` table
| Column             | Type        | Description                |
|--------------------|-------------|----------------------------|
| id                 | SERIAL PK   | Auto-increment ID          |
| date               | DATE        | Workout date               |
| warmup_treadmill   | BOOLEAN     | Treadmill warm-up          |
| warmup_bike        | BOOLEAN     | Bike warm-up               |
| warmup_elliptical  | BOOLEAN     | Elliptical warm-up         |
| exercises          | JSONB       | All sets as JSON object    |
| notes              | TEXT        | Session notes              |
| created_at         | TIMESTAMPTZ | Auto-set creation time     |

### `weight_entries` table
| Column    | Type          | Description              |
|-----------|---------------|--------------------------|
| id        | SERIAL PK     | Auto-increment ID        |
| date      | DATE (UNIQUE) | Weigh-in date            |
| value     | NUMERIC(5,1)  | Weight in lbs            |
| created_at| TIMESTAMPTZ   | Auto-set creation time   |

## API Endpoints

All endpoints are at `/api/<function>` (redirected from `/.netlify/functions/`).

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/workouts`       | List all workouts      |
| POST   | `/api/workouts`       | Save a new workout     |
| DELETE  | `/api/workouts?id=N` | Delete workout by ID   |
| GET    | `/api/weights`        | List all weight entries |
| POST   | `/api/weights`        | Log/update weight      |
| DELETE  | `/api/weights?date=Y` | Delete weight by date  |
| POST   | `/api/migrate`        | Create tables (idempotent) |

## Offline Fallback

The app caches all data in localStorage. If the API is unreachable (offline, local dev without DB), it falls back to local storage seamlessly.
