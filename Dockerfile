# Usa un'immagine Node leggera e stabile
FROM node:20-alpine

# Crea la cartella di lavoro
WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa TUTTE le dipendenze (senza cancellare nulla)
RUN npm install

# Copia tutto il resto del codice
COPY . .

# Costruisci il sito (crea la cartella dist)
RUN npm run build

# Esponi la porta 3000
EXPOSE 3000

# Avvia il sito sulla porta 3000 accessibile da fuori
CMD ["npx", "vite", "preview", "--port", "3000", "--host"]
