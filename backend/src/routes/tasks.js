const express = require('express');
const router  = express.Router();
const { getTaskStore } = require('../db');

// GET all
router.get('/', async (_req, res) => {
  try {
    const tasks = await getTaskStore().getAllTasks();
    res.json(tasks);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title?.trim())
    return res.status(400).json({ error: 'title is required' });
  try {
    const task = await getTaskStore().addTask(title.trim());
    res.status(201).json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH toggle done
router.patch('/:id', async (req, res) => {
  try {
    const task = await getTaskStore().toggleTask(req.params.id);
    if (!task)
      return res.status(404).json({ error: 'not found' });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await getTaskStore().deleteTask(req.params.id);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;