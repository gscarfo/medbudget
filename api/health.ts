
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const start = Date.now();
  
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ 
      status: 'offline', 
      message: 'Variabile DATABASE_URL mancante su Vercel.' 
    });
  }

  try {
    // Timeout manuale per il check
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      const tableExists = result.rows[0].exists;
      const latency = Date.now() - start;

      if (!tableExists) {
        return res.status(200).json({ 
          status: 'offline', 
          message: 'Connesso alla VPS, ma mancano le tabelle. Esegui lo script SQL fornito.',
          latency 
        });
      }

      return res.status(200).json({ status: 'online', latency });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('DB Health Error:', error);
    
    let userMessage = 'Errore di connessione alla VPS.';
    if (error.code === 'ECONNREFUSED') userMessage = 'Connessione rifiutata (Firewall o Porta 5432 chiusa).';
    if (error.code === '28P01') userMessage = 'Password del database errata.';
    if (error.code === '28000') userMessage = 'Utente database non autorizzato.';
    if (error.code === 'ETIMEDOUT') userMessage = 'Timeout connessione (il server non risponde).';

    return res.status(200).json({ 
      status: 'offline', 
      message: `${userMessage} Dettaglio: ${error.message}`
    });
  }
}
