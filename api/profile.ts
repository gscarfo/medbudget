
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM doctor_profile LIMIT 1');
      return res.status(200).json(result.rows[0] || null);
    } catch (error) {
      return res.status(500).json({ error: 'Errore nel recupero del profilo' });
    }
  }

  if (req.method === 'POST') {
    const { firstName, lastName, specialization, studioName } = req.body;
    try {
      // Semplificato: eliminiamo vecchi profili e inseriamo il nuovo
      await pool.query('DELETE FROM doctor_profile');
      const result = await pool.query(
        'INSERT INTO doctor_profile (first_name, last_name, specialization, studio_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [firstName, lastName, specialization, studioName]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Errore nel salvataggio del profilo' });
    }
  }
}
