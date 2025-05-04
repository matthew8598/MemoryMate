const express = require('express');
const ListAbl = require('../abl/ListAbl');
const List = require('../models/List');

const router = express.Router();

// Create a new list
router.post('/', (req, res) => {
  try {
    ListAbl.createList(req.body);
    res.status(201).send({ message: 'List created successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get all lists
router.get('/', async (req, res) => {
  const lists = await List.find().populate('tasks').sort({ date: 1 });
  res.json(lists);
});

module.exports = router;