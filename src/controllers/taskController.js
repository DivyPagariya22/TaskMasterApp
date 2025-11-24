// src/controllers/taskController.js
const taskService = require('../services/taskService');

async function createTask(req, res) {
  try {
    const userId = req.userId;
    const { title, description, priority, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const task = await taskService.createTask({ title, description, userId, priority, tags });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function listTasksForUser(req, res) {
  try {
    const userIdParam = req.params.id;
    const userId = req.userId;
    if (userIdParam !== userId) return res.status(403).json({ error: 'Forbidden' });
    const q = req.query;
    const data = await taskService.getTasksForUser(userId, q);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateTask(req, res) {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const changes = req.body;
    const updated = await taskService.updateTask(id, userId, changes);
    res.json(updated);
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ error: 'Task not found' });
    if (err.code === 'FORBIDDEN') return res.status(403).json({ error: 'Forbidden' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteTask(req, res) {
  try {
    const userId = req.userId;
    const id = req.params.id;
    await taskService.deleteTask(id, userId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ error: 'Task not found' });
    if (err.code === 'FORBIDDEN') return res.status(403).json({ error: 'Forbidden' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createTask,
  listTasksForUser,
  updateTask,
  deleteTask,
};
