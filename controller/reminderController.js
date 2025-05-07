const ReminderAbl = require('../abl/reminderAbl');

class ReminderController {
  static updateReminder(req, res) {
    try {
      const { id, newDate } = req.body;
      ReminderAbl.postponeTask(id, newDate);
      res.status(200).send({ message: 'Reminder updated successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }

  static deleteReminder(req, res) {
    try {
      const { id } = req.params;
      ReminderAbl.markTaskAsComplete(id);
      res.status(200).send({ message: 'Reminder deleted successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }

  static postponeTask(req, res) {
    try {
      const { id, newDate } = req.body;
      ReminderAbl.postponeTask(id, newDate);
      res.status(200).send({ message: 'Task postponed successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }

  static markTaskAsComplete(req, res) {
    try {
      const { id } = req.params;
      ReminderAbl.markTaskAsComplete(id);
      res.status(200).send({ message: 'Task marked as complete successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
}

module.exports = ReminderController;