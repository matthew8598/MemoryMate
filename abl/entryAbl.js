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
        console.log('Initial entryData:', entryData);
        // Automatically set the createdAt timestamp
        entryData.createdAt = new Date().toISOString();

        if (entryData.type === 'task') {
            entryData.title = entryData.dueDate; // Ensure task title is always the due date
        } else if (entryData.type === 'journal' && !entryData.title) {
            entryData.title = entryData.createdAt; // Set title to createdAt only if not provided
        }

        if (!validate(entryData)) {
            throw new Error('Invalid entry data');
        }
        if (entryData.type === 'task' && !entryData.dueDate) {
            throw new Error('Due date is required for task entries');
        }

        // Save the entry and get its ID
        const entryId = EntryDao.addEntry(entryData);

        // Sort the entry into the correct list by ID
        const listType = entryData.type;
        const listDate = entryData.type === 'journal' ? (entryData.title || entryData.createdAt) : entryData.dueDate;

        ListAbl.sortEntryIntoListById(listType, listDate, entryId);

        console.log('Final entryData before saving:', entryData);
        return entryId;
    }
}

module.exports = EntryAbl;