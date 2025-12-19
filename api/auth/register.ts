
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body;

  try {
    // In un'app reale useremmo bcrypt per hashare la password
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, password]
    );
    return res.status(201).json({ 
      user: result.rows[0],
      token: 'mock-jwt-token',
      hasProfile: false 
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username già esistente' });
    }
    return res.status(500).json({ error: 'Errore durante la registrazione' });
  }
}
