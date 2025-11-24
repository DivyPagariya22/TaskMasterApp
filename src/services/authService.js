// src/services/authService.js
const Session = require('../models/session');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

async function login({ email, password }) {
  const user = await User.findOne({ email, password }).lean();
  if (!user) {
    const e = new Error('Invalid credentials');
    e.code = 'INVALID_CREDENTIALS';
    throw e;
  }
  const token = `sess_${uuidv4()}`;
  const sess = new Session({ token, userId: user._id });
  await sess.save();
  return { token, userId: user._id.toString() };
}

async function validateToken(token) {
  if (!token) return null;
  const s = await Session.findOne({ token }).lean();
  return s || null;
}

async function deleteAllSessions() {
  return Session.deleteMany({});
}

module.exports = { login, validateToken, deleteAllSessions };
