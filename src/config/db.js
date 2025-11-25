// src/config/db.js
const mongoose = require('mongoose');

async function connect(uri, opts = {}) {
  const defaultOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  await mongoose.connect(process.env.MONGO_URI)
  return mongoose;
}

async function close() {
  await mongoose.connection.close();
}

module.exports = { connect, close };
