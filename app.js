// memorymate/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const entryController = require('./controller/entryController');
const listController = require('./controller/ListController');
const reminderController = require('./controller/reminderController');
const ReminderAbl = require('./abl/reminderAbl');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/entries', entryController);
app.use('/lists', listController);
app.use('/reminders', reminderController);

// Schedule reminders from entries.json on server startup
ReminderAbl.scheduleRemindersFromEntries();

// Endpoint to add a subscription
// app.post('/subscribe', (req, res) => {
//   const subscription = req.body;
//   try {
//     require('./utils/notificationService').addSubscription(subscription);
//     res.status(201).json({ message: 'Subscription added successfully!' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// Endpoint to trigger a notification
// app.post('/notify', (req, res) => {
//   try {
//     require('./utils/notificationService').sendNotifications();
//     res.status(200).json({ message: 'Notifications sent!' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Load SSL certificates
const options = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});

module.exports = app;
