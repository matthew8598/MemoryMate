// memorymate/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const entriesRouter = require('./routes/entries');
const listsRouter = require('./routes/todolists');
const remindersRouter = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/entries', entriesRouter);
app.use('/lists', listsRouter);
app.use('/reminders', remindersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`MemoryMate backend running on port ${PORT}`);
});

module.exports = app;
