// src/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const db = require('./config/db');

app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB using MONGO_URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

db.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.use('/users', userRoutes);
app.use('/sessions', authRoutes);
app.use('/tasks', taskRoutes);

app.get('/_health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`TaskMasterAPI listening on ${PORT}`));
}

module.exports = app;
