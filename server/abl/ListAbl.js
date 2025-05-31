const Ajv = require('ajv');
const ListDao = require('../dao/ListDao');
const addFormats = require('ajv-formats'); // Import ajv-formats

const ajv = new Ajv();
addFormats(ajv); // Add formats like "date-time"

const listSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['journal', 'task'] },
    date: { 
      type: 'string', },
    entries: {
      type: 'array',
      items: { type: 'integer' }, // Ensure entries only contain IDs
    },
  },
  required: ['type', 'date', 'entries'],
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
    const isJournal = listType === 'journal';
  
    
    let listDate = isJournal
      ? (entry.title || entry.createdAt)
      : entry.dueDate;
  
    console.log("list date1", listDate);
    console.log("entry title", entry.title);
  
  
    if (isValidDateString(entry.title)) {
      const dateObj = new Date(listDate);
      dateObj.setUTCHours(0, 0, 0, 0);
      listDate = dateObj.toISOString().split('T')[0];
      console.log("list date2", listDate);
    }
  
    let lists = ListDao.getAllLists();
    let list = lists.find(l => l.type === listType && l.date === listDate);
    if (!list) {
      console.log("list date3", listDate);
      list = { type: listType, date: listDate, entries: [] };
      lists.push(list);
    }
  
    // Log validation errors for debugging
    if (!validate(list)) {
      console.error('Validation failed for list:', list);
      console.error('Validation errors:', validate.errors);
      throw new Error('Invalid list data');
    }
  
    // Prevent duplicate entry IDs
    if (!list.entries.includes(entry.id)) {
      list.entries.push(entry.id);
    }
    ListDao.saveLists(lists);
  }

  static getAllLists() {
    return ListDao.getAllLists();
  }
  static deleteEmptyLists() {
  const lists = ListDao.getAllLists();
  const nonEmptyLists = lists.filter(list => list.entries.length > 0);
  ListDao.saveLists(nonEmptyLists);
  }
}  
  function isValidDateString(str) {
    const d = new Date(str);
    return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(str);
  }



module.exports = ListAbl;