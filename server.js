import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// IMPORTA LE TUE API
import transactionsHandler from './api/transactions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- ROTTE API ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "Il Server VPS è connesso e funzionante! 🚀" });
});

// Collegamento Transazioni (gestisce sia GET che POST)
app.all('/api/transactions', (req, res) => {
  transactionsHandler(req, res);
});

// -----------------

// Fallback per React (deve essere l'ultima rotta)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
