export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
  if (!AIRTABLE_KEY || !AIRTABLE_BASE) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  const allowedTables = [
    "tblpCi4w0kTzcTluj",
    "tblUsexUiBQHiBeX7",
    "tblL1sYsrPCPNfh1K",
    "tbleaJPbYHVAh4GKh",
    "tbldDOAGEaaPJGCH"
  ];

  const table = req.query.table || (req.body && req.body.table);
  if (!table) {
    return res.status(400).json({ error: "Missing table parameter" });
  }
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: "Table not allowed" });
  }

  try {
    if (req.method === "GET") {
      const qs = Object.keys(req.query)
        .filter(k => k !== "table")
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(req.query[k])}`)
        .join("&");
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}${qs ? "?" + qs : ""}`;

      const r = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY}`,
          "Content-Type": "application/json"
        }
      });

      const data = await r.json();
      return res.status(r.status).json(data);
    } else {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy server error", details: String(err) });
  }
}
