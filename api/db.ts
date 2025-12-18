
import { Pool } from 'pg';

// Assicurati di impostare DATABASE_URL nelle variabili d'ambiente di Vercel
// Esempio: postgres://user:password@vps-ip:5432/dbname
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessario se la tua VPS usa certificati self-signed
  }
});

export default pool;
