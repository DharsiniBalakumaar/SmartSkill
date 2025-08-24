const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const path = require('path');
const Question = require('./models/Questions'); // Import the Question model

const app = express();
app.use(cors());
dotenv.config();

mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


// async function uploadCSV() {
//   try {
//     // Read Excel file (update path if needed)
//     const filePath = path.join(__dirname, 'questions.xlsx');
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const jsonData = xlsx.utils.sheet_to_json(sheet);

//     // Map Excel keys to DB keys
//     /* const formattedData = jsonData.map(row => ({
//       question: row.Question,
//       option1: row.Option1,
//       option2: row.Option2,
//       option3: row.Option3,
//       option4: row.Option4,
//       correct_option: row.Correct_Option,
//       difficulty_level: row.DifficultyLevel
//     })); */

//     // Insert into MongoDB
//     await Question.insertMany(jsonData);
//     console.log('Data imported successfully');
//   } catch (err) {
//     console.error('Error importing XLSX data:', err);
//   }
// };


app.listen(5000,()=>{
  console.log('Server is running on port 5000');
});