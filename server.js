import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurazioni di base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Permetti al server di leggere i JSON che arrivano dal frontend
app.use(express.json());

// 1. SERVIRE IL SITO REACT (Frontend)
// Dice al server di prendere i file dalla cartella costruita da Vite
app.use(express.static(path.join(__dirname, 'dist')));

// 2. QUI ANDRANNO COLLEGATE LE TUE API
// (Per ora mettiamo un test per vedere se il VPS risponde)
app.get('/api/health', (req, res) => {
  res.json({ status: "Il Server VPS è connesso e funzionante! 🚀" });
});

// 3. QUALSIASI ALTRA RICHIESTA -> MANDA AL SITO REACT
// (Serve per far funzionare i link quando ricarichi la pagina)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Avvia il server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
