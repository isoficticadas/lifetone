require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const { google } = require('googleapis');
const compression = require('compression');
const mcache = require('memory-cache');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware global
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression()); // Habilitar compresión HTTP

// Caché en memoria
const cache = (duration) => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    }
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  };
};

// Servir archivos estáticos desde el directorio 'public'
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    },
  })
);

// Rutas estáticas
app.get('/', cache(60), (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/policy.html', cache(60), (req, res) => {
  res.sendFile(path.join(__dirname, 'policy.html'));
});

app.get('/gracias.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'gracias.html'));
});

// Variables de entorno para Google Sheets
const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SPREADSHEET_ID } = process.env;
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes
);
const sheets = google.sheets({ version: 'v4', auth });

// Ruta para manejar el envío del formulario
app.post('/submit', async (req, res) => {
  const { name, phone } = req.body;
  const namePattern = /^[A-Za-z\s]+$/;
  const phonePattern = /^\+593\d{9}$/;

  if (!name || !namePattern.test(name)) {
    return res.status(400).sendFile(path.join(__dirname, 'public/error.html'));
  }

  if (!phonePattern.test(phone)) {
    return res.status(400).sendFile(path.join(__dirname, 'public/error.html'));
  }

  const defaultData = 'Lifetone';
  const timestamp = new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Cliente!A:D',
      valueInputOption: 'RAW',
      resource: {
        values: [[name, phone, defaultData, timestamp]],
      },
    });

    res.redirect('/gracias.html'); // Redirigir a la página de agradecimiento
  } catch (error) {
    console.error('Error al enviar los datos:', error);
    res.status(500).sendFile(path.join(__dirname, 'public/error.html'));
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto localhost:${PORT}`);
});
