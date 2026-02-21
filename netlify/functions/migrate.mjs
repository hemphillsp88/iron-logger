import { neon } from "@netlify/neon";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers,
    });
  }

  const sql = neon();

  try {
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

    return new Response(
      JSON.stringify({ success: true, message: "Tables created" }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("migrate error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
