
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
      // Adattiamo i nomi delle colonne se necessario
      const transactions = result.rows.map(row => ({
        id: row.id.toString(),
        type: row.type,
        amount: parseFloat(row.amount),
        category: row.category,
        date: row.date.toISOString().split('T')[0],
        description: row.description
      }));
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ error: 'Errore nel recupero dei movimenti' });
    }
  }

  if (req.method === 'POST') {
    const { type, amount, category, date, description } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO transactions (type, amount, category, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [type, amount, category, date, description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Errore nel salvataggio del movimento' });
    }
  }
}
