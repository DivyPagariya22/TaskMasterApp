// src/services/userService.js
const User = require('../models/user');

async function createUser({ name, email, password }) {
  // Re-throw friendly error for duplicate
  try {
    console.log("Creating user with email:", email);
    const user = new User({ name, email, password });
    await user.save();
    return user.toObject();
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error('Email already exists');
      e.code = 'EMAIL_EXISTS';
      throw e;
    }
    throw err;
  }
}

async function getUserByEmail(email) {
  return User.findOne({ email }).lean();
}

async function getUserById(id) {
  return User.findById(id).lean();
}

async function deleteAllUsers() {
  return User.deleteMany({});
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  deleteAllUsers,
};
