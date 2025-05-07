const express = require('express');
const EntryAbl = require('../abl/ListAbl');
const Entry = require('../models/Entry');
const EntryDao = require('../dao/entryDao'); // Corrected import path

const router = express.Router();

// Create a new entry
router.post('/', (req, res) => {
  try {
    EntryAbl.createEntry(req.body);
    res.status(201).send({ message: 'Entry created successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get all entries
router.get('/', async (req, res) => {
  const entries = await Entry.find().sort({ createdAt: -1 });
  res.json(entries);
});

// Get entries by type and date
router.get('/by-type-and-date', (req, res) => {
  const { type, date } = req.query;
  try {
    const entries = EntryDao.getEntriesByTypeAndDate(type, date);
    res.json(entries);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;