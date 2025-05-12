const ReminderAbl = require('../abl/reminderAbl');
const EntryDao = require('../dao/entryDao'); // Corrected import path
const { formatError } = require('../utils/errorHandler');
const express = require('express');
const router = express.Router();

class ReminderController {
  static updateReminder(req, res) {
    try {
      const { id, newDate } = req.body;
      ReminderAbl.postponeTask(id, newDate);
      res.status(200).send({ message: 'Reminder updated successfully' });
    } catch (error) {
      res.status(400).send(formatError(error.message, 400));
    }
  }

  static deleteReminder(req, res) {
    try {
      const { id } = req.params;
      ReminderAbl.markTaskAsComplete(id);
      res.status(200).send({ message: 'Reminder deleted successfully' });
    } catch (error) {
      res.status(400).send(formatError(error.message, 400));
    }
  }

  static postponeTask(req, res) {
    try {
      const { id, newDate } = req.body;
      ReminderAbl.postponeTask(id, newDate);
      res.status(200).send({ message: 'Task postponed successfully' });
    } catch (error) {
      res.status(400).send(formatError(error.message, 400));
    }
  }

  static markTaskAsComplete(req, res) {
    try {
      const { id } = req.params;
      ReminderAbl.markTaskAsComplete(id);
      res.status(200).send({ message: 'Task marked as complete successfully' });
    } catch (error) {
      res.status(400).send(formatError(error.message, 400));
    }
  }
}

// Define routes
router.put('/update', ReminderController.updateReminder);
router.delete('/delete/:id', ReminderController.deleteReminder);
router.post('/postpone/:id', ReminderController.postponeTask);
router.put('/complete/:id', ReminderController.markTaskAsComplete);

router.post('/notification', async (req, res) => {
  try {
    ReminderAbl.scheduleDueDateNotification();
    res.status(200).send({ message: 'Due date notification scheduled successfully' });
  } catch (error) {
    res.status(500).send(formatError(error.message, 500));
  }
});

router.post("/reminderschedule", async (req, res) => {
  try {
    ReminderAbl.scheduleReminder();
    res.status(200).send({ message: 'Reminders scheduled successfully' });
  } catch (error) {
    res.status(500).send(formatError(error.message, 500));
  }
});

//Endpoint to handle due date notifications
router.post('/notification/dueDate', async (req, res) => {
  const { entryId } = req.body;
  try {
    const entry = await EntryDao.getEntryById(entryId);
    if (!entry) {
      return res.status(404).send({ error: 'Entry not found' });
    }

    if (entry.type !== 'task') {
      return res.status(400).send({ error: 'Only tasks have due dates' });
    }

    const dueDate = new Date(entry.dueDate);
    const currentDate = new Date();

    if (isNaN(dueDate.getTime())) {
      return res.status(400).send({ error: 'Invalid due date' });
    }

    if (dueDate <= currentDate) {
      ReminderAbl.sendDueDateNotification(entry);
      return res.status(200).send({ message: 'Due date notification sent successfully' });
    } else {
      return res.status(400).send({ error: 'Due date has not been reached yet' });
    }
  } catch (error) {
    res.status(500).send(formatError(error.message, 500));
  }
});

module.exports = router;