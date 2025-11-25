// src/config/db.js
const mongoose = require('mongoose');

async function connect(uri, opts = {}) {
  // Connect using the provided URI. Modern mongoose/mongo drivers handle options internally.
  if (!uri) throw new Error('URI required to connect to MongoDB');
  await mongoose.connect(uri);
  return mongoose;
}

async function close() {
  await mongoose.connection.close();
}

module.exports = { connect, close };
