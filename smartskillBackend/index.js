// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const Question = require('./models/Questions'); // your Question model
const User = require('./models/User');           // your User model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Optional: Listen to connection events
mongoose.connection.on('error', err => console.error('MongoDB error:', err));
mongoose.connection.once('open', () => console.log('MongoDB connection open'));

// ------------------ Routes ------------------

// ✅ Registration Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ------------------ Optional CSV/XLSX Upload ------------------
// You can uncomment and use this when needed
/*
async function uploadCSV() {
  try {
    const filePath = path.join(__dirname, 'questions.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    await Question.insertMany(jsonData);
    console.log('Data imported successfully');
  } catch (err) {
    console.error('Error importing XLSX data:', err);
  }
}
*/

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
