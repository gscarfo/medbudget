import pg from 'pg';
const { Pool } = pg;

// Crea il pool di connessione usando la variabile d'ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false // Fondamentale per i VPS
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
