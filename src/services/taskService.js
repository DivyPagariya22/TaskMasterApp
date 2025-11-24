// src/services/taskService.js
const Task = require('../models/task');

async function createTask({ title, description, userId, priority = 'medium', tags = [] }) {
  const t = new Task({ title, description, userId, priority, tags });
  await t.save();
  return t.toObject();
}

async function getTasksForUser(userId, { page = 1, limit = 20, status, priority, tag } = {}) {
  const filter = { userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (tag) filter.tags = tag;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;
  const skip = (page - 1) * limit;

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  return { total, page, limit, tasks };
}

async function getTaskById(id) {
  return Task.findById(id).lean();
}

async function updateTask(id, userId, changes, by = 'user') {
  const t = await Task.findById(id);
  if (!t) {
    const e = new Error('Task not found');
    e.code = 'NOT_FOUND';
    throw e;
  }
  if (t.userId.toString() !== userId.toString()) {
    const e = new Error('Forbidden');
    e.code = 'FORBIDDEN';
    throw e;
  }

  const old = t.toObject();

  if (changes.title !== undefined) t.title = changes.title;
  if (changes.description !== undefined) t.description = changes.description;
  if (changes.status !== undefined) t.status = changes.status;
  if (changes.priority !== undefined) t.priority = changes.priority;
  if (changes.tags !== undefined) t.tags = changes.tags;

  t.history = t.history || [];
  t.history.push({
    ts: new Date(),
    by,
    change: { from: old, to: t.toObject() },
  });

  await t.save();
  return t.toObject();
}

async function deleteTask(id, userId) {
  const t = await Task.findById(id);
  if (!t) {
    const e = new Error('Task not found');
    e.code = 'NOT_FOUND';
    throw e;
  }
  if (t.userId.toString() !== userId.toString()) {
    const e = new Error('Forbidden');
    e.code = 'FORBIDDEN';
    throw e;
  }
  await Task.deleteOne({ _id: id });
  return true;
}

async function deleteAllTasks() {
  return Task.deleteMany({});
}

module.exports = {
  createTask,
  getTasksForUser,
  getTaskById,
  updateTask,
  deleteTask,
  deleteAllTasks,
};
