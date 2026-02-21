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
    // GET — return all treadmill entries sorted by date
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, date, minutes, speed, incline, calories, notes, created_at
        FROM treadmill_entries ORDER BY date DESC
      `;
      return new Response(JSON.stringify(rows), { status: 200, headers });
    }

    // POST — save a new treadmill session
    if (req.method === "POST") {
      const body = await req.json();
      const { date, minutes, speed, incline, calories, notes } = body;

      if (!date || !minutes) {
        return new Response(
          JSON.stringify({ error: "date and minutes are required" }),
          { status: 400, headers }
        );
      }

      const [row] = await sql`
        INSERT INTO treadmill_entries (date, minutes, speed, incline, calories, notes)
        VALUES (
          ${date},
          ${minutes},
          ${speed || null},
          ${incline || null},
          ${calories || null},
          ${notes || ""}
        )
        RETURNING id, date, minutes, speed, incline, calories, notes, created_at
      `;

      return new Response(JSON.stringify(row), { status: 201, headers });
    }

    // DELETE — remove an entry by id
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({ error: "id query param required" }),
          { status: 400, headers }
        );
      }

      await sql`DELETE FROM treadmill_entries WHERE id = ${id}`;
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
    console.error("treadmill function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
