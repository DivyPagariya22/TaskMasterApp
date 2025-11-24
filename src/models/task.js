// src/models/task.js
const mongoose = require('mongoose');

const HistoryEntry = new mongoose.Schema({
  ts: { type: Date, default: Date.now },
  by: { type: String },
  change: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  tags: { type: [String], default: [] },
  history: { type: [HistoryEntry], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
