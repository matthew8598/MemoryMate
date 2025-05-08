const Ajv = require('ajv');
const addFormats = require('ajv-formats'); // Import ajv-formats
const EntryDao = require('../dao/entryDao'); // Corrected import path
const ListAbl = require('../abl/ListAbl');

const ajv = new Ajv();
addFormats(ajv); // Add formats like "date-time"

const entrySchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        reminder: {
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'string', pattern: '^\d+ (seconds|minutes|hours|days|weeks|months|years)$' }
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
        if (!validate(entryData)) {
            throw new Error('Invalid entry data');
        }
        EntryDao.addEntry(entryData);
    }
}

module.exports = EntryAbl;

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const EntryAblModule = require('../abl/entryAbl'); // Renamed import to avoid conflict

const entriesFilePath = path.join(__dirname, '../storage/entries.json');
const listsFilePath = path.join(__dirname, '../storage/lists.json');


describe('EntryAbl.createEntry', () => {
    it('should validate and create a valid task entry with due date as title', () => {
        const validTaskEntry = {
            content: 'This is a test task.',
            reminder: '2025-05-07T12:00:00Z', // Valid ISO 8601 date-time
            dueDate: '2025-05-07T12:00:00Z',
            type: 'task',
        };

        const entryId = EntryAblModule.createEntry(validTaskEntry);

        // Verify the entry exists in entries.json
        const entries = JSON.parse(fs.readFileSync(entriesFilePath, 'utf-8'));
        const createdEntry = entries.find(entry => entry.id === entryId);
        assert(createdEntry);

        // Verify the entry ID is stored in the appropriate list in lists.json
        const lists = JSON.parse(fs.readFileSync(listsFilePath, 'utf-8'));
        const list = lists.find(list => list.entries.includes(entryId));
        assert(list);
        assert.strictEqual(list.type, 'task');
        assert.strictEqual(list.date, validTaskEntry.dueDate.split('T')[0]); // Compare only the date part
    });

    it('should validate and create a valid journal entry with title as createdAt', () => {
        const validJournalEntry = {
            content: 'This is a journal entry.',
            type: 'journal',
        };

        const entryId = EntryAblModule.createEntry(validJournalEntry);

        // Verify the entry exists in entries.json
        const entries = JSON.parse(fs.readFileSync(entriesFilePath, 'utf-8'));
        const createdEntry = entries.find(entry => entry.id === entryId);
        assert(createdEntry);
        assert.strictEqual(createdEntry.title, validJournalEntry.createdAt);

        // Verify the entry ID is stored in the appropriate list in lists.json
        const lists = JSON.parse(fs.readFileSync(listsFilePath, 'utf-8'));
        const list = lists.find(list => list.entries.includes(entryId));
        assert(list);
        assert.strictEqual(list.type, 'journal');
        assert.strictEqual(list.date, validJournalEntry.createdAt.split('T')[0]); // Compare only the date part
    });

    it('should throw an error for invalid date-time format', () => {
        const invalidEntry = {
            content: 'This is a test task.',
            reminder: 'invalid-date', // Invalid date-time
            dueDate: '2025-05-07T12:00:00Z',
            type: 'task',
        };

        assert.throws(() => EntryAblModule.createEntry(invalidEntry), /Invalid entry data/);
    });

    it('should store multiple entries with the same date in the same list', () => {
        const entry1 = {
            content: 'First journal entry.',
            type: 'journal',
        };

        const entry2 = {
            content: 'Second journal entry.',
            type: 'journal',
        };

        const entryId1 = EntryAblModule.createEntry(entry1);
        const entryId2 = EntryAblModule.createEntry(entry2);

        // Verify both entries exist in entries.json
        const entries = JSON.parse(fs.readFileSync(entriesFilePath, 'utf-8'));
        const createdEntry1 = entries.find(entry => entry.id === entryId1);
        const createdEntry2 = entries.find(entry => entry.id === entryId2);
        assert(createdEntry1);
        assert(createdEntry2);

        // Verify both entries are stored in the same list in lists.json
        const lists = JSON.parse(fs.readFileSync(listsFilePath, 'utf-8'));
        const list = lists.find(list => list.entries.includes(entryId1) && list.entries.includes(entryId2));
        assert(list);
        assert.strictEqual(list.type, 'journal');
    });
});