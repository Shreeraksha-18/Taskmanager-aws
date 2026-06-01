const express = require('express');
const router  = express.Router();
const { pool } = require('../db');

// GET all
router.get('/', async (_req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title?.trim())
    return res.status(400).json({ error: 'title is required' });
  try {
    const r = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH toggle done
router.patch('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      'UPDATE tasks SET done = NOT done WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;