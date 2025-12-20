import pool from './db.js'; // Nota l'estensione .js!

export default async function handler(req, res) {
  // Legge l'ID utente dagli headers (assicurati che il frontend lo invii!)
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [userId]);
      const transactions = result.rows.map(row => ({
        id: row.id.toString(),
        type: row.type,
        amount: parseFloat(row.amount),
        category: row.category,
        date: new Date(row.date).toISOString().split('T')[0],
        description: row.description
      }));
      return res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore nel recupero dei movimenti' });
    }
  }

  if (req.method === 'POST') {
    const { type, amount, category, date, description } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO transactions (user_id, type, amount, category, date, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, type, amount, category, date, description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore nel salvataggio del movimento' });
    }
  }
  
  // Se il metodo non è né GET né POST
  return res.status(405).json({ error: 'Metodo non consentito' });
}
