// src/controllers/userController.js
const userService = require('../services/userService');

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await userService.createUser({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'EMAIL_EXISTS') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createUser,
};
