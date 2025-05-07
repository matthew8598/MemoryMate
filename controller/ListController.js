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

// Get lists and entries formatted for the dashboard
router.get('/dashboard', (req, res) => {
  try {
    const lists = ListAbl.getAllLists();
    const dashboardData = lists.map(list => ({
      type: list.type,
      date: list.date,
      entries: list.entries.map(entryId => {
        const entry = EntryDao.getEntryById(entryId);
        return {
          id: entry.id,
          title: entry.title,
          content: entry.content,
          reminder: entry.reminder,
          dueDate: entry.dueDate,
          type: entry.type
        };
      })
    }));
    res.json(dashboardData);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;