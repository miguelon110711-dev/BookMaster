import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authorsRouter from './routes/authors.js';
import booksRouter from './routes/books.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'BookMaster API y base de datos conectadas.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'No se pudo conectar con MySQL.' });
  }
});

app.use('/api/authors', authorsRouter);
app.use('/api/books', booksRouter);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));

app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'El ISBN ya está registrado.' });
  }
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'El cuerpo de la solicitud debe ser JSON válido.' });
  }
  res.status(500).json({ message: 'Error interno del servidor.' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`BookMaster API escuchando en http://localhost:${port}`));
