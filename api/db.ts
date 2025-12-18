
import { Pool } from 'pg';

// DATABASE_URL deve essere impostato nel pannello di controllo di Vercel
// Esempio: postgres://user:password@tuo-ip-vps:5432/nomedb
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // Timeout di 5 secondi per la connessione
  idleTimeoutMillis: 10000,      // Chiudi le connessioni inattive dopo 10 secondi
  ssl: {
    rejectUnauthorized: false    // Permette connessioni a VPS con certificati self-signed
  }
});

// Gestione errori globale del pool per evitare crash del processo
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
