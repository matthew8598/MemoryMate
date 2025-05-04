const Ajv = require('ajv');
const ReminderDao = require('../dao/ListDao');
const schedule = require('node-schedule');

const ajv = new Ajv();

// Removed userId field from schema
const reminderSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
  },
  required: ['message', 'date'],
  additionalProperties: false,
};

const validate = ajv.compile(reminderSchema);

class ReminderAbl {
  static createReminder(reminderData) {
    if (!validate(reminderData)) {
      throw new Error('Invalid reminder data');
    }
    ReminderDao.addReminder(reminderData);

    // Schedule the reminder
    if (reminderData.date) {
      this.scheduleReminder(reminderData);
    }
  }

  static scheduleReminder(reminderData) {
    const job = schedule.scheduleJob(new Date(reminderData.date), () => {
      this.sendReminderNotification(reminderData);

      // If it's an interval-based reminder, reschedule it
      if (reminderData.interval) {
        const nextDate = new Date();
        nextDate.setSeconds(nextDate.getSeconds() + this.parseInterval(reminderData.interval));
        reminderData.date = nextDate.toISOString();
        this.scheduleReminder(reminderData);
      }
    });

    return job;
  }

  static sendReminderNotification(reminderData) {
    console.log(`Reminder Notification: ${reminderData.message}`);
    // Placeholder for integrating a notification service for reminders
  }

  static scheduleDueDateNotification(taskData) {
    const job = schedule.scheduleJob(new Date(taskData.dueDate), () => {
      this.sendDueDateNotification(taskData);
    });

    return job;
  }

  static sendDueDateNotification(taskData) {
    console.log(`Due Date Notification: Task '${taskData.title}' is due.`);
    // Placeholder for integrating a notification service for due dates
  }

  static parseInterval(interval) {
    const [value, unit] = interval.split(' ');
    const multiplier = {
      seconds: 1,
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800,
      months: 2592000, // Approximation
      years: 31536000, // Approximation
    }[unit];

    return parseInt(value, 10) * multiplier;
  }

  static markTaskAsComplete(taskId) {
    // Logic to mark a task as complete and stop reminders
    ReminderDao.removeReminder(taskId);
    console.log(`Task ${taskId} marked as complete.`);
  }

  static postponeTask(taskId, newDate) {
    const reminder = ReminderDao.getReminder(taskId);
    if (reminder) {
      reminder.date = newDate;
      this.scheduleReminder(reminder);
      console.log(`Task ${taskId} postponed to ${newDate}.`);
    }
  }
}

module.exports = ReminderAbl;