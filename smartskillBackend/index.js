const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const Question = require('./models/Questions');
const User = require('./models/User');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

mongoose.connection.on('error', err => console.error('❌ MongoDB error:', err));
mongoose.connection.once('open', () => console.log('📡 MongoDB connection open'));

// ------------------ Routes ------------------

// ✅ Registration Route
app.post('/register', async (req, res) => {
  console.log('📝 Register endpoint hit');
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  console.log('👤 Login endpoint hit');
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get 10 random or fixed questions
app.get('/questions', async (req, res) => {
  console.log('❓ Questions endpoint hit');
  try {
    const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
    res.json({ success: true, questions });
  } catch (err) {
    console.error('❌ Error fetching questions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Forgot Password Route (send reset link)
app.post('/forgot-password', async (req, res) => {
  console.log('🔒 Forgot Password endpoint hit');
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    await transporter.verify();
    console.log("✅ Email server ready");
    const resetLink = `http://localhost:5173/reset/${resetToken}`;
    const info = await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click this link to reset your password:</p>
              <a href="${resetLink}">${resetLink}</a>
              <p>This link will expire in 1 hour.</p>`
    });
    console.log("✅ Email sent:", info.messageId);
    res.json({ success: true, message: 'Reset link sent to email' });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Reset Password Route (with token)
app.post('/reset-password/:token', async (req, res) => {
  console.log('🔄 Reset Password endpoint hit');
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      return res.json({ success: false, message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Verify Answer and Justification Route
app.post('/verify-answer', async (req, res) => {
  console.log('✅ Verify Answer endpoint hit');
  const { qId, selectedOption, justification } = req.body;
  try {
    const question = await Question.findById(qId);
    if (!question) {
      console.error('❌ Question not found for verification:', qId);
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    const isCorrect = selectedOption === question.Correct_Option;
    res.json({ success: true, isCorrect });
  } catch (err) {
    console.error('❌ Error verifying answer:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ------------------ Optional CSV/XLSX Upload ------------------
// Uncomment and install 'xlsx' if you need to bulk-import questions
/*
const xlsx = require('xlsx');
async function uploadCSV() {
  try {
    const filePath = path.join(__dirname, 'questions.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    await Question.insertMany(jsonData);
    console.log('✅ Data imported successfully');
  } catch (err) {
    console.error('❌ Error importing XLSX data:', err);
  }
}
*/

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
