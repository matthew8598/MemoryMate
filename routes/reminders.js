const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const sendNotification = require('../utils/notifications'); // Utility to handle notifications

// Check reminders for a user
router.get('/check/:userId', async (req, res) => {
    try {
        const now = new Date();
        const reminders = await Entry.find({
            userId: req.params.userId,
            reminder: { $lte: now }
        });

        // Send notifications for each triggered reminder
        for (const reminder of reminders) {
            await sendNotification(reminder.userId, `Reminder: ${reminder.title || 'No title'}`);
        }

        res.json(reminders);
    } catch (error) {
        console.error('Error checking reminders:', error);
        res.status(500).json({ error: 'Failed to check reminders' });
    }
});

module.exports = router;
