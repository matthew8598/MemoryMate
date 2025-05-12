const Ajv = require('ajv');
const schedule = require('node-schedule');
const addFormats = require('ajv-formats'); // Import ajv-formats
const fs = require('fs');
const path = require('path');
const EntryDao = require('../dao/entryDao'); // Corrected import path

const ajv = new Ajv();
addFormats(ajv); // Add formats like "date-time"

const entriesFilePath = path.join(__dirname, '../storage/entries.json');

// Removed reminderSchema and related validation logic

class ReminderAbl {
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
    if (isNaN(new Date(taskData.dueDate).getTime())) {
      throw new Error('Invalid dueDate provided');
    }
    const job = schedule.scheduleJob(new Date(taskData.dueDate), () => {
      this.sendDueDateNotification(taskData);
    });

    return job;
  }

  static sendDueDateNotification(taskData) {
    console.log(`Due Date Notification: Task '${taskData.title}' is due.`);
    // Placeholder for integrating a notification service for due dates
    console.log("Options: [Mark as Complete]");
  }

  static scheduleReminderNotification(reminderData) {
    const job = schedule.scheduleJob(new Date(reminderData.date), () => {
      this.sendReminderNotification(reminderData);
    });

    return job;
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
    try {
      EntryDao.updateEntryById(taskId, { completed: true });
      console.log(`Task ${taskId} marked as complete.`);
    } catch (error) {
      console.error(`Error marking task as complete: ${error.message}`);
    }
  }

  static postponeTask(taskId, newDate) {
    try {
      EntryDao.updateEntryById(taskId, { dueDate: newDate });
      console.log(`Task ${taskId} postponed to ${newDate}.`);
    } catch (error) {
      console.error(`Error postponing task: ${error.message}`);
    }
  }

  static scheduleRemindersFromEntries() {
    const entries = EntryDao.getAllEntries();

    entries.forEach((entry) => {
        if (entry.type === 'task') {
            if (!entry.dueDate) {
                console.warn(`Skipping task entry without dueDate: ${JSON.stringify(entry)}`);
                return;
            }

            const dueDate = new Date(entry.dueDate);
            if (dueDate > new Date()) {
                schedule.scheduleJob(dueDate, () => {
                    this.sendDueDateNotification(entry);
                });
            }
        }

        if (entry.reminder) {
            const reminderDate = new Date(entry.reminder);
            if (reminderDate > new Date()) {
                schedule.scheduleJob(reminderDate, () => {
                    this.sendReminderNotification(entry);
                });
            }
        }
    });
  }

  static sendDueDateNotification(entry) {
    console.log(`Due Date Notification: Task '${entry.title}' is due.`);
    console.log("Options: [Mark as Complete]");
  }

  static sendReminderNotification(entry) {
    console.log(`Reminder Notification: ${entry.content}`)
  }
}

module.exports = ReminderAbl;