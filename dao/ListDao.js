const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../storage/lists.json');

class ListDao {
  static getAllLists() {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error('Error reading or parsing lists.json:', error);
        return [];
    }
  }

  static saveLists(lists) {
    fs.writeFileSync(filePath, JSON.stringify(lists, null, 2));
  }

  static addList(list) {
    const lists = this.getAllLists();
    lists.push(list);
    this.saveLists(lists);
  }
    
  static getListByTypeAndDate(type, date) {
    const lists = this.getAllLists();
    const normalizedDate = date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0]; // Normalize date to YYYY-MM-DD format
    return lists.find(list => list.type === type && list.date === normalizedDate);
  }

  static addEntryToList(listType, listDate, entryId) {
    const lists = this.getAllLists();
    console.log(listDate);
    const listDateString = listDate instanceof Date ? listDate.toISOString().split('T')[0] : listDate; // Normalize date to YYYY-MM-DD format
    console.log(listDateString);
    let list = lists.find(list => list.type === listType && list.date === listDateString);
    if (!list) {
      list = { type: listType, date: listDateString, entries: [] };
      lists.push(list);
    }
    list.entries.push(entryId); // Store only the entry ID
    this.saveLists(lists); // Save the updated lists
  }
}

module.exports = ListDao;