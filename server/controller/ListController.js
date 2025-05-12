const express = require('express');
const ListAbl = require('../abl/ListAbl');
const { formatError } = require('../utils/errorHandler');

const router = express.Router();

// Create a new list
router.post('/', (req, res) => {
  try {
    ListAbl.createList(req.body);
    res.status(201).send({ message: 'List created successfully' });
  } catch (error) {
    res.status(400).send(formatError(error.message, 400));
  }
});

// endpoint to retrieve all lists
router.get('/', async (req, res) => {
  try {
    const lists = await ListAbl.getAllLists();
    res.json(lists);
  } catch (error) {
    res.status(400).send(formatError(error.message, 400));
  }
});

//endpoint to retrieve lists formatted for the dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const lists = await ListAbl.getAllLists();
    const dashboardData = lists.map(list => ({
      type: list.type,
      date: list.date,
      entries: list.entries.map(entry => ({
        id: entry._id,
        title: entry.title,
        content: entry.content,
        reminder: entry.reminder,
        dueDate: entry.dueDate,
        type: entry.type
      }))
    }));
    res.json(dashboardData);
  } catch (error) {
    res.status(400).send(formatError(error.message, 400));
  }
});

module.exports = router;