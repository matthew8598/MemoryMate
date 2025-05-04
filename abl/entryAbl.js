const Ajv = require('ajv');
const EntryDao = require('../dao/ListDao');
const ListAbl = require('./ListAbl');

const ajv = new Ajv();

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
  required: ['title', 'type', 'createdAt'],
  additionalProperties: false,
};

const validate = ajv.compile(entrySchema);

class EntryAbl {
  static createEntry(entryData) {
    // Automatically set the createdAt timestamp
    entryData.createdAt = new Date().toISOString();

    if (!validate(entryData)) {
      throw new Error('Invalid entry data');
    }

    // Sort the entry into the correct list
    const listType = entryData.type === 'journal' ? 'journal' : 'task';
    const listDate = entryData.type === 'journal' ? (entryData.title || entryData.createdAt) : entryData.dueDate;

    EntryDao.addEntry({ ...entryData, listType, listDate });

    // Automatically sort the entry into a list
    ListAbl.sortEntryIntoList(entryData);
  }
}

module.exports = EntryAbl;