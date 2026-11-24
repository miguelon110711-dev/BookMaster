import { Router } from 'express';
import pool from '../db.js';
import { validateBook, validateId } from '../validation.js';

const router = Router();

// GET /api/books?page=1&limit=10
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM books');
    const [rows] = await pool.query(
      `SELECT b.id, b.titulo, b.isbn, b.anio_publicacion, b.autor_id, b.created_at,
              a.nombre AS autor_nombre, a.apellido AS autor_apellido
       FROM books b INNER JOIN authors a ON a.id=b.autor_id
       ORDER BY b.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

// GET /api/books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    const [rows] = await pool.query(
      `SELECT b.*, a.nombre AS autor_nombre, a.apellido AS autor_apellido
       FROM books b INNER JOIN authors a ON a.id=b.autor_id WHERE b.id=?`, [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Libro no encontrado.' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

// POST /api/books
router.post('/', async (req, res, next) => {
  try {
    const { errors, data } = validateBook(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const [authors] = await pool.query('SELECT id FROM authors WHERE id=?', [data.autor_id]);
    if (!authors.length) return res.status(404).json({ message: 'El autor seleccionado no existe.' });
    const [result] = await pool.query(
      'INSERT INTO books (titulo, isbn, anio_publicacion, autor_id) VALUES (?, ?, ?, ?)',
      [data.titulo, data.isbn, data.anio_publicacion, data.autor_id]
    );
    res.status(201).json({ message: 'Libro creado correctamente.', id: result.insertId, ...data });
  } catch (error) { next(error); }
});

// PUT /api/books/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    const { errors, data } = validateBook(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const [existing] = await pool.query('SELECT id FROM books WHERE id=?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Libro no encontrado.' });
    const [authors] = await pool.query('SELECT id FROM authors WHERE id=?', [data.autor_id]);
    if (!authors.length) return res.status(404).json({ message: 'El autor seleccionado no existe.' });
    await pool.query(
      'UPDATE books SET titulo=?, isbn=?, anio_publicacion=?, autor_id=? WHERE id=?',
      [data.titulo, data.isbn, data.anio_publicacion, data.autor_id, id]
    );
    res.json({ message: 'Libro actualizado correctamente.', id, ...data });
  } catch (error) { next(error); }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    const [result] = await pool.query('DELETE FROM books WHERE id=?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Libro no encontrado.' });
    res.json({ message: 'Libro eliminado correctamente.' });
  } catch (error) { next(error); }
});

export default router;
