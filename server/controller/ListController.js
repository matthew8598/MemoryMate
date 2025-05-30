const express = require('express');
const ListAbl = require('../abl/ListAbl');
const { formatError } = require('../utils/errorHandler');
const EntryDao = require('../dao/entryDao');

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

    const tasks = await Promise.all(
      lists
        .filter(list => list.type === 'task')
        .map(async list => {
          const entries = await Promise.all(
            list.entries.map(entryId => EntryDao.getEntryById(entryId))
          );
          return {
            title: list.date, // Due date as the title
            contents: entries.map(entry => {
              let reminder = null;
              if (entry.reminderMulti) {
                // Multi-day reminder
                return {
                  id: entry.id,
                  title: entry.title,
                  content: entry.content,
                  reminderMulti: entry.reminderMulti,
                  dueDate: entry.dueDate
                };
              } else {
                reminder = entry.reminderInterval || (entry.reminder ? `${entry.reminder.split('T')[0]} ${entry.reminder.slice(11, 16)}` : null);
                return {
                  id: entry.id,
                  title: entry.title,
                  content: entry.content,
                  reminder,
                  dueDate: entry.dueDate
                };
              }
            })
          };
        })
    );

    const journals = await Promise.all(
      lists
        .filter(list => list.type === 'journal')
        .map(async list => {
          const entries = await Promise.all(
            list.entries.map(entryId => EntryDao.getEntryById(entryId))
          );
          return {
            title: list.date, // Creation date or title
            contents: entries.map(entry => {
              let reminder = null;
              if (entry.reminderMulti) {
                return {
                  id: entry.id,
                  title: entry.title,
                  content: entry.content,
                  createdAt: entry.createdAt,
                  reminderMulti: entry.reminderMulti
                };
              } else {
                reminder = entry.reminderInterval || (entry.reminder ? `${entry.reminder.split('T')[0]} ${entry.reminder.slice(11, 16)}` : null);
                return {
                  id: entry.id,
                  title: entry.title,
                  content: entry.content,
                  createdAt: entry.createdAt,
                  reminder
                };
              }
            })
          };
        })
    );

    tasks.sort((a, b) => new Date(a.title) - new Date(b.title)); // Closest due dates first
    journals.sort((a, b) => new Date(b.title) - new Date(a.title)); // Last created first
    res.json({ tasks, journals });
  } catch (error) {
    res.status(400).send(formatError(error.message, 400));
  }
});

module.exports = router;