// airtable-proxy.js
export default async function handler(req, res) {
  // Empêche toute autre méthode que POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Vérifie les données envoyées par ton site Webflow
  const { table, method, query, body } = req.body;

  // Sécurité : seules certaines tables sont autorisées
  const allowedTables = [
    "tblpCi4w0kTzcTluj", // Tables
    "tblUsexUiBQHiBeX7", // Paramètres
    "tblL1sYsrPCPNfh1K", // Réservations
    "tbleaJPbYHVAh4GKh", // Fermetures exceptionnelles
    "tbldDOAGEaaPJGCH"  // Ouvertures exceptionnelles
  ];

  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: "Table non autorisée" });
  }

  const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}${query ? "?" + query : ""}`;

  try {
    const airtableResp = await fetch(url, {
      method: method || "GET",
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await airtableResp.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Erreur proxy:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
