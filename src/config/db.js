// src/config/db.js
const mongoose = require('mongoose');

async function connect(uri, opts = {}) {
  const defaultOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  await mongoose.connect(uri, { ...defaultOpts, ...opts });
  return mongoose;
}

async function close() {
  await mongoose.connection.close();
}

module.exports = { connect, close };
