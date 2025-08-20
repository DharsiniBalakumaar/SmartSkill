const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  Question: { type: mongoose.Schema.Types.Mixed, required: true },
  Option1: { type: mongoose.Schema.Types.Mixed, required: true },
  Option2: { type: mongoose.Schema.Types.Mixed, required: true },
  Option3: { type: mongoose.Schema.Types.Mixed, required: true },
  Option4: { type: mongoose.Schema.Types.Mixed, required: true },
  Correct_Option: { type: mongoose.Schema.Types.Mixed, required: true },
  DifficultyLevel: { type: mongoose.Schema.Types.Mixed, required: false},
});

module.exports = mongoose.model('Question', questionSchema);
