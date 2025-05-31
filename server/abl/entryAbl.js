const Ajv = require('ajv');
const addFormats = require('ajv-formats'); // Import ajv-formats
const EntryDao = require('../dao/entryDao'); // Corrected import path
const ListAbl = require('./ListAbl');

const ajv = new Ajv();
addFormats(ajv); // Add formats like "date-time"

// Explicitly add the "date-time" format if needed
ajv.addFormat('date-time', {
    validate: (dateTimeString) => !isNaN(Date.parse(dateTimeString)),
});

const entrySchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        reminder: {
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'string', pattern: '^\\d+ (second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)( at \\d{2}:\\d{2})?$' },
                { type: 'string', pattern: '^(\\d+-)+\\d+( at \\d{2}:\\d{2})?$' } // e.g., 1-7-14 or 1-7-14 at 13:10
            ]
        },
        dueDate: { type: 'string', format: 'date-time' },
        type: { type: 'string', enum: ['journal', 'task'] },
        createdAt: { type: 'string', format: 'date-time' }
    },
    required: ['type',"content",],
    additionalProperties: false,
};

const validate = ajv.compile(entrySchema);

class EntryAbl {
    static createEntry(entryData) {
        // Automatically set the createdAt timestamp
        entryData.createdAt = new Date().toISOString();

        if (entryData.type === 'task') {
            entryData.title = new Date(entryData.dueDate).toISOString(); // Ensure task title is always the due date
        } else if (entryData.type === 'journal') {
            console.log("Entryabl",entryData.title);
            if (entryData.title === undefined) {
                console.log("Entryabl",entryData.title);
                entryData.title = entryData.createdAt; // Set title to createdAt if not provided
            }
        }
        if (!validate(entryData)) {
            console.error('Entry validation failed:', entryData);
            console.error('Validation errors:', validate.errors);
            throw new Error('Invalid entry data');
        }
        if (entryData.type === 'task' && !entryData.dueDate) {
            throw new Error('Due date is required for task entries');
        }

        // Save the entry and get its ID
        const entryId = EntryDao.addEntry(entryData);

        // Sort the entry into the correct list by ID
        const listType = entryData.type;
        let listDate;

        if (entryData.type === 'journal') {
            // Normalize the date to ensure same-day entries are grouped together
            const dateObj = new Date(entryData.createdAt);
            dateObj.setUTCHours(0, 0, 0, 0); // Set time to the start of the day
            listDate = dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        } else {
            listDate = entryData.dueDate;
        }

        ListAbl.sortEntryIntoList({
            id: entryId,
            type: listType,
            title: entryData.title,
            createdAt: entryData.createdAt,
            dueDate: entryData.dueDate
        });

        // --- SCHEDULE REMINDERS/DUE DATE NOTIFICATIONS ON CREATION ---
        // Dynamically require ReminderAbl to avoid circular dependency
        const ReminderAbl = require('./reminderAbl');
        // Schedule due date notification for tasks
        if (entryData.type === 'task' && entryData.dueDate) {
            ReminderAbl.scheduleDueDateNotification({
                ...entryData,
                id: entryId
            });
        }
        // Schedule reminder notification if present
        if (entryData.reminder) {
            // Determine if reminder is a date-time, interval string, or multi-day interval string
            const isDateTime = !isNaN(Date.parse(entryData.reminder));
            const intervalPattern = /^\d+ (second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)( at \d{2}:\d{2})?$/i;
            const multiDayPattern = /^(\d+-)+\d+( at \d{2}:\d{2})?$/;
            const ReminderAbl = require('./reminderAbl');
            if (isDateTime) {
                ReminderAbl.scheduleReminder({
                    ...entryData,
                    id: entryId,
                    date: entryData.reminder
                });
            } else if (intervalPattern.test(entryData.reminder)) {
                // Store the original interval string in reminderInterval
                EntryDao.updateEntryById(entryId, { reminderInterval: entryData.reminder });
                ReminderAbl.scheduleReminder({
                    ...entryData,
                    id: entryId,
                    date: new Date().toISOString(), // Start from now
                    interval: entryData.reminder // Pass the interval string
                });
            } else if (multiDayPattern.test(entryData.reminder)) {
                // Parse days and optional time
                const [daysPart, timePart] = entryData.reminder.split(' at ');
                const days = daysPart.split('-').map(Number);
                let hour = 9, minute = 0; // Default time 09:00
                if (timePart) {
                    const [h, m] = timePart.split(':').map(Number);
                    hour = h;
                    minute = m;
                }
                const now = new Date();
                const reminderDates = days.map(d => {
                    const date = new Date(now);
                    date.setDate(date.getDate() + d);
                    date.setHours(hour, minute, 0, 0);
                    return date;
                });
                // Store the original multi-day string for deletion logic
                EntryDao.updateEntryById(entryId, { reminderMulti: entryData.reminder });
                ReminderAbl.scheduleMultiReminders({
                    ...entryData,
                    id: entryId,
                    reminderDates: reminderDates.map(d => d.toISOString()),
                    originalMulti: entryData.reminder
                });
            }
        }
        return entryId;
    }
}

module.exports = EntryAbl;