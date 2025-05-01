const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  content: { type: String },
  reminder: { type: Date },
  dueDate: { type: Date },
  type: { type: String, enum: ['journal', 'todo'], default: 'journal' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Entry', entrySchema);
