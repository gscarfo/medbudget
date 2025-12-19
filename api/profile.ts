
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM doctor_profile WHERE user_id = $1', [userId]);
      return res.status(200).json(result.rows[0] || null);
    } catch (error) {
      return res.status(500).json({ error: 'Errore nel recupero del profilo' });
    }
  }

  if (req.method === 'POST') {
    const { firstName, lastName, specialization, studioName } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO doctor_profile (user_id, first_name, last_name, specialization, studio_name) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (user_id) DO UPDATE SET 
            first_name = EXCLUDED.first_name, 
            last_name = EXCLUDED.last_name, 
            specialization = EXCLUDED.specialization, 
            studio_name = EXCLUDED.studio_name 
         RETURNING *`,
        [userId, firstName, lastName, specialization, studioName]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Errore nel salvataggio del profilo' });
    }
  }
}
