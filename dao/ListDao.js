const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../storage/lists.json');

class ListDao {
  static getAllLists() {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
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
}

module.exports = ListDao;