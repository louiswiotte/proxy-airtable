export default async function handler(req, res) {
  // Autoriser toutes les origines (tu peux restreindre plus tard à ton domaine Webflow)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { base, table } = req.query;
  if (!base || !table) {
    res.status(400).json({ error: "Missing base or table parameter" });
    return;
  }

  const url = `https://api.airtable.com/v0/${base}/${table}`;
  const method = req.method;
  const headers = {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    let airtableRes;
    if (method === "GET") {
      const queryParams = new URLSearchParams(req.query);
      queryParams.delete("base");
      queryParams.delete("table");
      airtableRes = await fetch(`${url}?${queryParams.toString()}`, { headers });
    } else if (method === "POST") {
      airtableRes = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(req.body),
      });
    } else {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const data = await airtableRes.json();
    res.status(airtableRes.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
