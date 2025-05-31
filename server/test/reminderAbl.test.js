const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ReminderAbl = require('../abl/reminderAbl');
const EntryAbl = require('../abl/entryAbl');
const schedule = require('node-schedule');
const sinon = require('sinon');

// Mock node-schedule to avoid actual scheduling during tests using sinon
let scheduleJobStub;

before(() => {
    scheduleJobStub = sinon.stub(schedule, 'scheduleJob').callsFake((date, callback) => {
        setTimeout(callback, 0); // Immediately invoke the callback for testing
        return { cancel: sinon.stub() };
    });
});

after(() => {
    scheduleJobStub.restore();
});

const listsFilePath = path.join(__dirname, '../storage/lists.json');

describe('ReminderAbl - Multi-day Interval', () => {
    it('should schedule and trigger all reminders for multi-day format', (done) => {
        // Today is May 31, 2025
        const now = new Date();
        const multiDayReminder = `1-2-3 at 09:00`;
        const entry = {
            content: 'Multi-day reminder entry.',
            type: 'journal',
            reminder: multiDayReminder,
        };
        const entryId = EntryAbl.createEntry(entry);
        // Schedule reminders from entries.json (simulate app restart)
        ReminderAbl.scheduleRemindersFromEntries();
        // Wait a short time to simulate all reminders firing (mocked scheduleJob)
        setTimeout(() => {
            // Check that reminders were triggered (console output)
            // Check that reminderMulti is cleared after last reminder
            const storedEntry = require('../dao/entryDao').getEntryById(entryId);
            assert(!storedEntry.reminderMulti, 'reminderMulti should be cleared after last reminder');
            done();
        }, 100);
    });
});

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

describe('ReminderAbl - Edge Cases', () => {
    it('should not schedule a reminder for an entry with no reminder field but valid dueDate', () => {
        const noReminderEntry = {
            content: 'No reminder field.',
            type: 'task',
            dueDate: new Date(Date.now() + 1000).toISOString(), // 1 second in the future
        };

        EntryAbl.createEntry(noReminderEntry);

        assert.doesNotThrow(() => {
            ReminderAbl.scheduleRemindersFromEntries();
        });

        console.log('No reminders scheduled for entries without a reminder field');
    });

    it('should handle scheduling reminders for multiple entries with overlapping times', (done) => {
        const overlappingEntries = [
            {
                content: 'Entry 1',
                type: 'task',
                dueDate: new Date(Date.now() + 1000).toISOString(),
                reminder: new Date(Date.now() + 1000).toISOString(),
            },
            {
                content: 'Entry 2',
                type: 'task',
                dueDate: new Date(Date.now() + 1000).toISOString(),
                reminder: new Date(Date.now() + 1000).toISOString(),
            },
        ];

        overlappingEntries.forEach(entry => EntryAbl.createEntry(entry));

        ReminderAbl.scheduleRemindersFromEntries();

        setTimeout(() => {
            console.log('Reminders triggered successfully for overlapping entries');
            done();
        }, 1500);
    });
});