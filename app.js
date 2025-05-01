// memorymate/app.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const usersRoute = require('./routes/users');
const entriesRoute = require('./routes/entries');
const todoListsRoute = require('./routes/todolists');
const remindersRoute = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/users', usersRoute);
app.use('/entries', entriesRoute);
app.use('/todo-lists', todoListsRoute);
app.use('/reminders', remindersRoute);

// Start server
app.listen(PORT, () => {
    console.log(`MemoryMate backend running on port ${PORT}`);
});
