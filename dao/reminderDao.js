const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../storage/reminders.json');

class ReminderDao {
  static getAllReminders() {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }

  static saveReminders(reminders) {
    fs.writeFileSync(filePath, JSON.stringify(reminders, null, 2));
  }

  static addReminder(reminder) {
    const reminders = this.getAllReminders();
    reminders.push(reminder);
    this.saveReminders(reminders);
  }
}

module.exports = ReminderDao;