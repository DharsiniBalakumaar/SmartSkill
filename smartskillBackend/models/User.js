const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  quizDate: { type: Date, default: Date.now },
  totalScore: Number,
  totalPossibleScore: Number,
  scorePercentage: Number,
  recommendedLevel: String,
  recommendedCourse: {
    name: String,
    description: String,
    links: [{
      type: String,
      title: String,
      url: String
    }]
  },
  answers: [{
    qId: String,
    Question: String,
    selected: String,
    selectedJustification: String,
    correct: Boolean,
    isJustificationRelevant: Boolean,
    totalScore: Number,
    officialJustification: String,
    officialKeywords: [String],
    difficulty: String
  }]
}, { _id: false }); // Use { _id: false } for subdocument arrays to avoid MongoDB array indexing bugs

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  resetToken: String,
  resetTokenExpiry: Date,
  progress: [progressSchema] // Array of progress entries
});

module.exports = mongoose.model('User', userSchema);
