const express = require('express');
const EntryAbl = require('../abl/entryAbl');
const EntryDao = require('../dao/entryDao'); // Corrected import path
const { formatError } = require('../utils/errorHandler');

const router = express.Router();

// Create a new entry
router.post('/', (req, res) => {
  try {
    EntryAbl.createEntry(req.body);
    res.status(201).send({ message: 'Entry created successfully' });
  } catch (error) {
    res.status(400).send(formatError(error.message, 400));
  }
});

// Get all entries
router.get('/', async (req, res) => {
  const entries = await EntryDao.getAllEntries();
  res.json(entries);
});

// Updated endpoint to retrieve entries by type and date
router.get('/entries', async (req, res) => {
  const { type, date } = req.query;
  try {
    const entries = await EntryDao.getEntriesByTypeAndDate(type, date);
    res.json(entries);
  } catch (error) {
    res.status(400).send(formatError(error.message, 400));
  }
});

module.exports = router;