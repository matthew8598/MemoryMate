const express = require('express');
const router = express.Router();
const ToDoList = require('../models/ToDoList');

// Get all ToDo lists for a user
router.get('/:userId', async (req, res) => {
    const lists = await ToDoList.find({ userId: req.params.userId })
        .populate('tasks')
        .sort({ date: 1 });
    res.json(lists);
});

module.exports = router;
