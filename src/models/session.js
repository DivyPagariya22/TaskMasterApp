// src/models/session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;
