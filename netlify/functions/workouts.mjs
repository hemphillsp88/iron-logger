import { neon } from "@netlify/neon";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const sql = neon();

  try {
    // GET — return all workouts sorted by date
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, date, warmup_treadmill, warmup_bike, warmup_elliptical,
               exercises, notes, created_at
        FROM workouts ORDER BY date DESC
      `;
      return new Response(JSON.stringify(rows), { status: 200, headers });
    }

    // POST — save a new workout session
    if (req.method === "POST") {
      const body = await req.json();
      const { date, warmup, exercises, notes } = body;

      if (!date || !exercises) {
        return new Response(
          JSON.stringify({ error: "date and exercises are required" }),
          { status: 400, headers }
        );
      }

      const [row] = await sql`
        INSERT INTO workouts (date, warmup_treadmill, warmup_bike, warmup_elliptical, exercises, notes)
        VALUES (
          ${date},
          ${warmup?.treadmill || false},
          ${warmup?.bike || false},
          ${warmup?.elliptical || false},
          ${JSON.stringify(exercises)},
          ${notes || ""}
        )
        RETURNING id, date, warmup_treadmill, warmup_bike, warmup_elliptical, exercises, notes, created_at
      `;

      return new Response(JSON.stringify(row), { status: 201, headers });
    }

    // DELETE — remove a workout by id (passed as query param)
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "id query param required" }),
          { status: 400, headers }
        );
      }

      await sql`DELETE FROM workouts WHERE id = ${id}`;
      return new Response(JSON.stringify({ deleted: id }), {
        status: 200,
        headers,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (err) {
    console.error("workouts function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
