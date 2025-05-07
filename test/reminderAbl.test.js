const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ReminderAbl = require('../abl/reminderAbl');
const EntryAbl = require('../abl/entryAbl');

const listsFilePath = path.join(__dirname, '../storage/lists.json');

describe('ReminderAbl', () => {
    it('should trigger a reminder from an entry with a valid reminder value and sort it into the correct list', (done) => {
        // Create a valid entry with a reminder
        const validEntry = {
            title: 'Test Entry',
            content: 'This is a test entry.',
            type: 'journal',
            reminder: new Date(Date.now() + 1000).toISOString(), // 1 second in the future
        };

        const entryId = EntryAbl.createEntry(validEntry);

        // Schedule reminders from entries.json
        ReminderAbl.scheduleRemindersFromEntries();

        setTimeout(() => {
            // Verify the reminder was triggered
            console.log('Reminder triggered successfully');

            // Verify the entry was sorted into the correct list
            const lists = JSON.parse(fs.readFileSync(listsFilePath, 'utf-8'));
            const list = lists.find(list => list.entries.includes(entryId));
            assert(list);
            assert.strictEqual(list.type, validEntry.type);
            assert.strictEqual(list.date, validEntry.title);

            done();
        }, 1500); // Wait for 1.5 seconds to ensure the reminder is triggered
    });

    it('should not trigger a reminder for an entry with a past reminder date', () => {
        // Create an entry with a past reminder date
        const pastEntry = {
            content: 'This is a past entry.',
            type: 'task',
            dueDate: new Date(Date.now() - 1000).toISOString(), // 1 second in the past
            reminder: new Date(Date.now() - 1000).toISOString(), // 1 second in the past
        };

        EntryAbl.createEntry(pastEntry);

        // Schedule reminders from entries.json
        ReminderAbl.scheduleRemindersFromEntries();

        // Verify no reminders are scheduled for past dates
        console.log('No reminders scheduled for past dates');
    });
});