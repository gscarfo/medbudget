
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = userResult.rows[0];
    const profileResult = await pool.query('SELECT 1 FROM doctor_profile WHERE user_id = $1', [user.id]);

    return res.status(200).json({
      user,
      token: 'mock-jwt-token',
      hasProfile: profileResult.rows.length > 0
    });
  } catch (error) {
    return res.status(500).json({ error: 'Errore durante il login' });
  }
}
