import { Router } from 'express';
import pool from '../db.js';
import { validateAuthor, validateBook, validateId } from '../validation.js';

const router = Router();

// GET /api/authors?page=1&limit=10
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM authors');
    const [rows] = await pool.query(
      `SELECT a.id, a.nombre, a.apellido, a.nacionalidad, a.created_at,
              COUNT(b.id) AS total_libros
       FROM authors a LEFT JOIN books b ON b.autor_id = a.id
       GROUP BY a.id ORDER BY a.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

// GET /api/authors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    const [rows] = await pool.query('SELECT * FROM authors WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Autor no encontrado.' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

// POST /api/authors
router.post('/', async (req, res, next) => {
  try {
    const { errors, data } = validateAuthor(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const [result] = await pool.query(
      'INSERT INTO authors (nombre, apellido, nacionalidad) VALUES (?, ?, ?)',
      [data.nombre, data.apellido, data.nacionalidad]
    );
    res.status(201).json({ message: 'Autor creado correctamente.', id: result.insertId, ...data });
  } catch (error) { next(error); }
});

// PUT /api/authors/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    const { errors, data } = validateAuthor(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const [existing] = await pool.query('SELECT id FROM authors WHERE id=?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Autor no encontrado.' });
    await pool.query('UPDATE authors SET nombre=?, apellido=?, nacionalidad=? WHERE id=?',
      [data.nombre, data.apellido, data.nacionalidad, id]);
    res.json({ message: 'Autor actualizado correctamente.', id, ...data });
  } catch (error) { next(error); }
});

// DELETE /api/authors/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    const [existing] = await pool.query('SELECT id FROM authors WHERE id=?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Autor no encontrado.' });
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM books WHERE autor_id=?', [id]);
    if (total > 0) return res.status(409).json({ message: 'No se puede eliminar: el autor tiene libros asociados.' });
    await pool.query('DELETE FROM authors WHERE id=?', [id]);
    res.json({ message: 'Autor eliminado correctamente.' });
  } catch (error) { next(error); }
});

// POST /api/authors/:id/books — crea un libro asociado al autor (relación 1:N).
router.post('/:id/books', async (req, res, next) => {
  try {
    const autor_id = validateId(req.params.id);
    if (!autor_id) return res.status(400).json({ message: 'El ID del autor debe ser un entero positivo.' });
    const { errors, data } = validateBook({ ...req.body, autor_id });
    if (errors.length) return res.status(400).json({ errors });
    const [authors] = await pool.query('SELECT id FROM authors WHERE id=?', [autor_id]);
    if (!authors.length) return res.status(404).json({ message: 'El autor indicado no existe.' });
    const [result] = await pool.query(
      'INSERT INTO books (titulo, isbn, anio_publicacion, autor_id) VALUES (?, ?, ?, ?)',
      [data.titulo, data.isbn, data.anio_publicacion, autor_id]
    );
    res.status(201).json({ message: 'Libro asociado al autor correctamente.', id: result.insertId, ...data });
  } catch (error) { next(error); }
});

export default router;
