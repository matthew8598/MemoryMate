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


// Integrate notificationService
const notificationService = require('../utils/notificationService');

// Map to keep track of scheduled jobs by entry ID
const scheduledJobs = {};

class ReminderAbl {
  static scheduleReminder(reminderData) {
    // Cancel any existing job for this entry
    if (reminderData.id && scheduledJobs[reminderData.id]) {
      scheduledJobs[reminderData.id].cancel();
      delete scheduledJobs[reminderData.id];
    }
    // If this is an interval reminder, and the date is in the past or now, schedule for now + interval
    let scheduleDate = new Date(reminderData.date);
    if (reminderData.interval && scheduleDate <= new Date()) {
      // Parse interval and set next valid date
      const intervalSeconds = this.parseInterval(reminderData.interval);
      scheduleDate = new Date(Date.now() + intervalSeconds * 1000);
      // Update the entry's reminder date in storage
      EntryDao.updateEntryById(reminderData.id, { reminder: scheduleDate.toISOString() });
      reminderData.date = scheduleDate.toISOString();
    }
    const job = schedule.scheduleJob(scheduleDate, async () => {
      // Check if the entry still exists and has a valid reminder
      const entry = EntryDao.getEntryById(reminderData.id);
      if (!entry || !entry.reminder) {
        // Entry deleted or reminder turned off, do not send notification or reschedule
        if (reminderData.id && scheduledJobs[reminderData.id]) {
          scheduledJobs[reminderData.id].cancel();
          delete scheduledJobs[reminderData.id];
        }
        return;
      }
      this.sendReminderNotification(reminderData);

      // If it's an interval-based reminder, reschedule it only if still valid
      if (reminderData.interval && entry.reminder) {
        // Calculate next reminder date based on the previous scheduled date, not current time
        const prevDate = new Date(reminderData.date);
        const intervalSeconds = this.parseInterval(reminderData.interval);
        const nextDate = new Date(prevDate.getTime() + intervalSeconds * 1000);
        // Update the entry's reminder date in storage
        EntryDao.updateEntryById(reminderData.id, { reminder: nextDate.toISOString() });
        // Schedule the next reminder
        const nextReminderData = { ...reminderData, date: nextDate.toISOString() };
        scheduledJobs[reminderData.id] = this.scheduleReminder(nextReminderData);
      } else if (reminderData.id && scheduledJobs[reminderData.id]) {
        // Clean up if not rescheduling
        scheduledJobs[reminderData.id].cancel();
        delete scheduledJobs[reminderData.id];
      }
    });
    if (reminderData.id) {
      scheduledJobs[reminderData.id] = job;
    }
    return job;
  }

  static sendReminderNotification(reminderData) {
    // Send push notification to all subscribers
    const message = JSON.stringify({
      title: reminderData.title || 'MemoryMate Reminder',
      body: reminderData.content || reminderData.message || 'You have a reminder!',
      content: reminderData.content || '',
      type: 'reminder',
      id: reminderData.id || reminderData.entryId || null,
      date: reminderData.date || null
    });
    notificationService.sendNotification(message);
    console.log(`Reminder Notification: ${reminderData.content || reminderData.message}`);
  }

  static scheduleDueDateNotification(taskData) {
    // Cancel any existing job for this entry
    if (taskData.id && scheduledJobs[taskData.id]) {
      scheduledJobs[taskData.id].cancel();
      delete scheduledJobs[taskData.id];
    }
    if (isNaN(new Date(taskData.dueDate).getTime())) {
      throw new Error('Invalid dueDate provided');
    }
    const job = schedule.scheduleJob(new Date(taskData.dueDate), () => {
      // Check if the entry still exists and is not completed
      const entry = EntryDao.getEntryById(taskData.id);
      if (!entry || entry.completed) {
        if (taskData.id && scheduledJobs[taskData.id]) {
          scheduledJobs[taskData.id].cancel();
          delete scheduledJobs[taskData.id];
        }
        return;
      }
      this.sendDueDateNotification(taskData);
      // Clean up after sending
      if (taskData.id && scheduledJobs[taskData.id]) {
        scheduledJobs[taskData.id].cancel();
        delete scheduledJobs[taskData.id];
      }
    });
    if (taskData.id) {
      scheduledJobs[taskData.id] = job;
    }
    return job;
  }

  static sendDueDateNotification(taskData) {
    // Send push notification to all subscribers
    const message = JSON.stringify({
      title: `You have a task due:`,
      body: taskData.content || `Task '${taskData.title || ''}' is due.`,
      content: taskData.content || '',
      type: 'dueDate',
      entryId: taskData.id || taskData.entryId || null,
      dueDate: taskData.dueDate || null,
      options: ['Mark as Complete', 'Postpone']
    });
    notificationService.sendNotification(message);
    console.log(`Due Date Notification: Task '${taskData.title}' is due.`);
    console.log("Options: [Mark as Complete]");
  }

  static scheduleReminderNotification(reminderData) {
    const job = schedule.scheduleJob(new Date(reminderData.date), () => {
      this.sendReminderNotification(reminderData);
    });
    return job;
  }

  static parseInterval(interval) {
    // Accepts formats like "3 days", "2 hours", "15 minutes", "1 week at 12:00" matching the schema in entryAbl
    if (!interval) return 0;
    // Schema: ^\d+ (second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)( at \d{2}:\d{2})?$ 
    const match = interval.trim().match(/^(\d+)\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)(?: at (\d{2}):(\d{2}))?$/i);
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const atHour = match[3] !== undefined ? parseInt(match[3], 10) : null;
    const atMinute = match[4] !== undefined ? parseInt(match[4], 10) : null;
    const multiplier = {
      second: 1,
      seconds: 1,
      minute: 60,
      minutes: 60,
      hour: 3600,
      hours: 3600,
      day: 86400,
      days: 86400,
      week: 604800,
      weeks: 604800,
      month: 2592000, // Approximation
      months: 2592000,
      year: 31536000, // Approximation
      years: 31536000,
    }[unit];
    // If 'at HH:MM' is specified, return an object for special handling
    if (atHour !== null && atMinute !== null) {
      return { seconds: value * multiplier, atHour, atMinute };
    }
    return value * multiplier;
  }

  static markTaskAsComplete(taskId) {
    try {
      EntryDao.updateEntryById(taskId, { completed: true, reminder: null });
      // Cancel any scheduled jobs for this entry
      if (scheduledJobs[taskId]) {
        scheduledJobs[taskId].cancel();
        delete scheduledJobs[taskId];
      }
      console.log(`Task ${taskId} marked as complete.`);
    } catch (error) {
      console.error(`Error marking task as complete: ${error.message}`);
    }
  }

  static postponeTask(taskId, newDate) {
    try {
      EntryDao.updateEntryById(taskId, { dueDate: newDate });
      // Reschedule due date notification
      if (scheduledJobs[taskId]) {
        scheduledJobs[taskId].cancel();
        delete scheduledJobs[taskId];
      }
      const entry = EntryDao.getEntryById(taskId);
      if (entry && entry.dueDate) {
        this.scheduleDueDateNotification({ ...entry, id: taskId });
      }
      console.log(`Task ${taskId} postponed to ${newDate}.`);
    } catch (error) {
      console.error(`Error postponing task: ${error.message}`);
    }
  }

  static scheduleRemindersFromEntries() {
    // Cancel all existing jobs
    Object.values(scheduledJobs).forEach(job => job.cancel());
    Object.keys(scheduledJobs).forEach(key => delete scheduledJobs[key]);

    const entries = EntryDao.getAllEntries();

    entries.forEach((entry) => {
      if (entry.type === 'task' && entry.dueDate && !entry.completed) {
        const dueDate = new Date(entry.dueDate);
        if (dueDate > new Date()) {
          this.scheduleDueDateNotification({ ...entry, id: entry.id });
        }
      }

      if (entry.reminder && !entry.completed) {
        const reminderDate = new Date(entry.reminder);
        if (reminderDate > new Date()) {
          this.scheduleReminder({ ...entry, id: entry.id, date: entry.reminder, interval: entry.interval });
        }
      }
    });
  }

  // sendDueDateNotification and sendReminderNotification are now handled above with push notifications
}

module.exports = ReminderAbl;