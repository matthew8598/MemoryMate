const fs = require('fs');
const path = require('path');
const ListDao = require('./ListDao');
const e = require('express');
const ListAbl = require('../abl/ListAbl');

const filePath = path.join(__dirname, '../storage/entries.json');

class EntryDao {
  static getAllEntries() {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }

  static saveEntries(entries) {
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
  }

  static addEntry(entry) {
    const entries = this.getAllEntries();
    entry.id = entries.length ? entries[entries.length - 1].id + 1 : 1; // Assign a unique ID
    entries.push(entry);
    this.saveEntries(entries);
    return entry.id; // Return the ID of the newly added entry
  }

  static getEntriesByTypeAndDate(type, date) {
    const entries = this.getAllEntries();
    return entries.filter(entry => entry.type === type && entry.listDate === date);
  }

  static getEntryById(id) {
    const entries = this.getAllEntries();
    return entries.find(entry => entry.id === id);
  }

  static updateEntryById(id, updatedFields) {
    const entries = this.getAllEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
      throw new Error(`Entry with ID ${id} not found`);
    }
    entries[entryIndex] = { ...entries[entryIndex], ...updatedFields };
    this.saveEntries(entries);
    return entries[entryIndex];
  }

  static deleteEntryById(id) {
    const entries = this.getAllEntries();
    let idNum = Number(id);
    console.log(id)
    if (isNaN(idNum)) {
      throw new Error(`Invalid ID: ${id}`);
    }
    console.log(entries[0].id, idNum);
    const entryIndex = entries.findIndex(entry => entry.id == idNum);
    console.log(`Entry index: ${entryIndex}`);
    if (entryIndex === -1) {
      throw new Error(`Entry with ID ${id} not found`);
    }
    entries.splice(entryIndex, 1);
    this.saveEntries(entries);
    const lists = ListDao.getAllLists();
    lists.forEach(list => {
      list.entries = list.entries.filter(entryId => entryId !== idNum);
    });

    ListDao.saveLists(lists);
    ListAbl.deleteEmptyLists(); // Call the function to delete empty lists
    return true; // Indicate successful deletion
  }
}

module.exports = EntryDao;