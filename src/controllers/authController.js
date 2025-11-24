// src/controllers/authController.js
const authService = require('../services/authService');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const { token, userId } = await authService.login({ email, password });
    res.json({ token, userId });
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid credentials' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { login };
