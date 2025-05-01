const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a user
router.post('/', async (req, res) => {
    try {
        const user = new User({ username: req.body.username });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

module.exports = router;
