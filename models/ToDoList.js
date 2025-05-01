const mongoose = require('mongoose');

const todoListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type : { type: String, enum: ['journal', 'todo'], default: 'journal' },
  date: { type: String, required: true }, // e.g., "Tue Apr 29 2025"
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }]
}, { timestamps: true });

module.exports = mongoose.model('ToDoList', todoListSchema);
