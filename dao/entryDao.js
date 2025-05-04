const fs = require('fs');
const path = require('path');

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
    entries.push(entry);
    this.saveEntries(entries);
  }

  static getEntriesByTypeAndDate(type, date) {
    const entries = this.getAllEntries();
    return entries.filter(entry => entry.type === type && entry.listDate === date);
  }
}

module.exports = EntryDao;