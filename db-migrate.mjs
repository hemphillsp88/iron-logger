import { neon } from "@netlify/neon";

const sql = neon();

async function migrate() {
  console.log("🔧 Running database migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS workouts (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      warmup_treadmill BOOLEAN DEFAULT FALSE,
      warmup_bike BOOLEAN DEFAULT FALSE,
      warmup_elliptical BOOLEAN DEFAULT FALSE,
      exercises JSONB NOT NULL DEFAULT '{}',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS weight_entries (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL UNIQUE,
      value NUMERIC(5,1) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_entries(date DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS treadmill_entries (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      minutes NUMERIC(5,1) NOT NULL,
      speed NUMERIC(4,1),
      incline NUMERIC(4,1),
      calories INTEGER,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_treadmill_date ON treadmill_entries(date DESC)`;

  console.log("✅ Migration complete — tables ready.");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
