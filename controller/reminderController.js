const ReminderAbl = require('../abl/ListAbl');

class ReminderController {
  static createReminder(req, res) {
    try {
      ReminderAbl.createReminder(req.body);
      res.status(201).send({ message: 'Reminder created successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
}

module.exports = ReminderController;