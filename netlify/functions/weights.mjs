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
    // GET — return all weight entries sorted by date
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, date, value, created_at
        FROM weight_entries ORDER BY date ASC
      `;
      return new Response(JSON.stringify(rows), { status: 200, headers });
    }

    // POST — upsert a weight entry (update if date exists)
    if (req.method === "POST") {
      const body = await req.json();
      const { date, value } = body;

      if (!date || value === undefined || value === null) {
        return new Response(
          JSON.stringify({ error: "date and value are required" }),
          { status: 400, headers }
        );
      }

      const [row] = await sql`
        INSERT INTO weight_entries (date, value)
        VALUES (${date}, ${value})
        ON CONFLICT (date) DO UPDATE SET value = ${value}
        RETURNING id, date, value, created_at
      `;

      return new Response(JSON.stringify(row), { status: 201, headers });
    }

    // DELETE — remove a weight entry by date (query param)
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const date = url.searchParams.get("date");

      if (!date) {
        return new Response(
          JSON.stringify({ error: "date query param required" }),
          { status: 400, headers }
        );
      }

      await sql`DELETE FROM weight_entries WHERE date = ${date}`;
      return new Response(JSON.stringify({ deleted: date }), {
        status: 200,
        headers,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  } catch (err) {
    console.error("weights function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};
