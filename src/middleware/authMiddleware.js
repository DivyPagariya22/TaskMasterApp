// src/middleware/authMiddleware.js
const authService = require('../services/authService');

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const session = await authService.validateToken(token);
    if (!session) return res.status(401).json({ error: 'Invalid token' });
    req.userId = session.userId.toString();
    next();
  } catch (err) {
    console.error('auth error', err);
    res.status(500).json({ error: 'Internal auth error' });
  }
}

module.exports = authMiddleware;
