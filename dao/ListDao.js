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
    return lists.find(list => list.type === type && list.date === date);
  }

  static addEntryToList(listType, listDate, entryId) {
    const lists = this.getAllLists();
    let list = lists.find(list => list.type === listType && list.date === listDate);
    if (!list) {
      list = { type: listType, date: listDate, entries: [] };
      lists.push(list);
    }
    list.entries.push(entryId); // Store only the entry ID
    this.saveLists(lists); // Save the updated lists
  }
}

module.exports = ListDao;