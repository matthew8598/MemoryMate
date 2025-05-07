const Ajv = require('ajv');
const ListDao = require('../dao/ListDao');
const addFormats = require('ajv-formats'); // Import ajv-formats

const ajv = new Ajv();
addFormats(ajv); // Add formats like "date-time"

const listSchema = {
  type: 'object',
  properties: {
    date: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          completed: { type: 'boolean' },
        },
        required: ['text', 'completed'],
      },
    },
  },
  required: ['date', 'items'],
  additionalProperties: false,
};

const validate = ajv.compile(listSchema);

class ListAbl {
  static createList(listData) {
    if (!validate(listData)) {
      throw new Error('Invalid list data');
    }
    ListDao.addList(listData);
  }

  static sortEntryIntoList(entry) {
    const listType = entry.type;
    const listDate = entry.type === 'journal' ? (entry.title || entry.createdAt) : entry.dueDate;

    // Check if the list exists
    let list = ListDao.getListByTypeAndDate(listType, listDate);
    if (!list) {
      // Create a new list if it does not exist
      list = { type: listType, date: listDate, entries: [] };
      ListDao.addList(list);
    }
    if(!validate(list)) {
      throw new Error('Invalid list data');
    }
    // Add the entry to the list
    list.entries.push(entry);
    ListDao.saveLists(list);
  }

  static sortEntryIntoListById(listType, listDate, entryId) {
    ListDao.addEntryToList(listType, listDate, entryId);
  }
}

module.exports = ListAbl;