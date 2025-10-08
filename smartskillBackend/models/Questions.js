// File: smartskillBackend/models/Questions.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Option1: { type: String, required: true },
  Option2: { type: String, required: true },
  Option3: { type: String, required: true },
  Option4: { type: String, required: true },
  Correct_Option: { type: String, required: true },
  DifficultyLevel: { type: String, required: false},
  // --- NEW FIELDS ---
  Justification_Text: { 
    type: String, // Ensure this is a string
    required: false, 
  },
  keywords: { 
    type: [String],
    default: [],
    index: true 
  }
});

module.exports = mongoose.model('Question', questionSchema);