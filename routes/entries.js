const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const ToDoList = require('../models/ToDoList');

// Helper
const getDefaultTitle = () => `Journal Entry on ${new Date().toLocaleDateString()}`;

// Create a new entry
router.post('/', async (req, res) => {
    try {
        const { userId, title, content, reminder, dueDate, type } = req.body;
        const entry = new Entry({
            userId,
            title: title || getDefaultTitle(),
            content,
            reminder,
            dueDate: type === 'todo' ? dueDate : null,
            type: type || 'journal'
        });
        await entry.save();

        let dateKey;
        if (type === 'todo') {
            dateKey = new Date(dueDate).toDateString();
        } else {
            dateKey = new Date().toDateString();  // use title as date key
        }
            let list = await ToDoList.findOne({ userId, type, date: dateKey });
            if (!list) list = new ToDoList({ userId, type, date: dateKey });
            list.tasks.push(entry._id);
            await list.save();

        res.status(201).json(entry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all entries for a user
router.get('/:userId', async (req, res) => {
    const entries = await Entry.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(entries);
});

module.exports = router;
