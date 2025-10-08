// File: smartskillBackend/index.js (FINAL, COMPLETE CODE with OpenRouter)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const { spawn } = require('child_process'); // For Python ML Integration

const Question = require('./models/Questions');
const User = require('./models/User');

// --- AI/Keyword Imports ---
const generateKeywords = require('./utils/keywordGenerator'); 
const generateOfficialContent = require('./utils/geminiContentGenerator'); 
// 📢 CHANGE: Replaced GoogleGenAI with OpenAI for OpenRouter compatibility
const { OpenAI } = require('openai'); 
// --------------------------

dotenv.config(); // Load all environment variables

// --- DEBUG: Check Environment Variable ---
console.log('OpenRouter Key Loaded?', !!process.env.OPENROUTER_API_KEY); 
// -----------------------------------------

// ------------------ AI Initialization (OpenRouter Setup) ------------------
// Initialize the AI client for OpenRouter using the OpenAI SDK structure
const ai = new OpenAI({ 
    apiKey: process.env.OPENROUTER_API_KEY, 
    baseURL: 'https://openrouter.ai/api/v1', // 👈 OpenRouter's endpoint
});
// --------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

// ------------------ MongoDB Connection (Unchanged) ------------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

mongoose.connection.on('error', err => console.error('❌ MongoDB error:', err));
mongoose.connection.once('open', () => console.log('📡 MongoDB connection open'));

// ------------------ Python ML Utility Function (Unchanged) ------------------
function runPythonPrediction(question) {
    return new Promise((resolve, reject) => {
        // NOTE: You may need to change 'python' to 'python3' depending on your OS setup.
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'predict_difficulty.py'), 
            question
        ]);
        
        let pythonOutput = '';
        let pythonError = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            pythonError += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`❌ Python script exited with code ${code}. Stderr: ${pythonError}`);
                // Resolve with error state so the main Node process doesn't crash
                return resolve({ success: false, difficulty: 'Error', error: pythonError });
            }
            
            try {
                const result = JSON.parse(pythonOutput);
                resolve(result);
            } catch (parseErr) {
                console.error('❌ Failed to parse Python output:', pythonOutput);
                resolve({ success: false, difficulty: 'Error', error: 'Invalid response from ML service.' });
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('Python Spawn Error:', err);
            reject({ success: false, difficulty: 'Error', error: err.message });
        });
    });
}
// ----------------------------------------------------------------

// ------------------ Authentication Routes (Unchanged) ------------------

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
    
    // Generate token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();
    
    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });
    await transporter.verify();
    console.log("✅ Email server ready");
    
    // Create the reset link (adjust host/port as necessary for your frontend)
    const resetLink = `http://localhost:5173/reset/${resetToken}`;
    
    const info = await transporter.sendMail({
      from: `"SmartSkill Support" <${process.env.EMAIL_USER}>`,
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
    res.status(500).json({ success: false, message: 'Error sending reset email: ' + err.message });
  }
});

// ✅ Reset Password Route (with token)
app.post('/reset-password/:token', async (req, res) => {
  console.log('🔄 Reset Password endpoint hit');
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    // Find user by token and ensure token has not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Update password and clear token fields
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

// ----------------------------------------------------
// ✅ NEW: AI PYTHON TUTOR CHATBOT ROUTE (UPDATED FOR OPENROUTER)
// ----------------------------------------------------
app.post('/chat/tutor', async (req, res) => {
    console.log('💬 Chatbot Tutor endpoint hit');
    const { userQuery, history } = req.body; 

    if (!userQuery) {
        return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    try {
        // 1. Run ML Prediction to get difficulty level
        const predictionResult = await runPythonPrediction(userQuery);
        const predictedLevel = predictionResult.success ? predictionResult.difficulty : 'Unknown';
        
        // 2. Define the LLM's persona and objective
        const systemPromptText = `
            You are 'SmartSkill Tutor', an encouraging and expert Python programming assistant. 
            Your primary function is to act as a supportive mentor. 
            Your task is to evaluate the user's query, provide a detailed and helpful explanation, and confirm the topic's difficulty level.
            
            The predicted difficulty level for the user's question is: **${predictedLevel}**.
            
            Format your response clearly:
            - Start with the detailed explanation and supporting code examples where necessary.
            - Conclude with the difficulty assessment based on the prediction.
        `;

        // 3. Assemble the messages array: [System Message] + [History from Frontend]
        const messages = [
            { role: 'system', content: systemPromptText }, // System message first
            ...history.map(msg => ({ 
                role: msg.role,
                content: msg.parts[0].text // Extract text from the parts array
            }))
        ];


        // 4. Call OpenRouter API using the OpenAI SDK's chat completions method
        const openRouterResponse = await ai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo', // Chosen model on OpenRouter
            messages: messages,
        });

        // 5. Extract the response text
        const tutorResponse = openRouterResponse.choices[0].message.content;

        res.json({
            success: true,
            tutorResponse,
            predictedLevel
        });

    } catch (err) {
        console.error('❌ Chatbot API error:', err);
        const status = err.status || 500; 
        const message = err.message || 'Error processing tutor request. Check OpenRouter API key/funds.';

        res.status(status).json({ success: false, message: `Server Error: ${message}` });
    }
});


// ------------------ Other Routes (Unchanged) ------------------

// ✅ ML Prediction Endpoint (Exposed)
app.post('/predict-difficulty', async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question text is required.' });

    try {
        const result = await runPythonPrediction(question);
        if (result.success) {
            res.json({ success: true, difficulty: result.difficulty });
        } else {
            res.status(500).json(result);
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not execute prediction system.' });
    }
});


// ✅ AI-POWERED Route: GENERATE JUSTIFICATION & KEYWORDS (One-Time Bulk Run)
app.post('/questions/generate-content-ai', async (req, res) => {
  console.log('✨ AI Content Generation endpoint hit');
  
  try {
    // Query finds documents where Justification_Text is missing or explicitly null/empty
    const questions = await Question.find({ 
        $or: [
            { Justification_Text: { $exists: false } }, 
            { Justification_Text: null },                
            { Justification_Text: "" }                  
        ]
    }).limit(50); 

    if (questions.length === 0) {
        return res.json({ success: true, message: 'No questions found needing justification/keywords. Run complete.' });
    }

    let generatedCount = 0;
    const bulkOps = [];
    
    for (const q of questions) {
        // Pass the initialized 'ai' client to the utility function
        // NOTE: This function currently uses the old Gemini SDK implementation
        // If this route is used, it will fail unless generateOfficialContent is updated.
        const { justification, keywords } = await generateOfficialContent(q, ai); 

        if (justification) { 
            generatedCount++;
            
            bulkOps.push({
                updateOne: {
                    filter: { _id: q._id },
                    update: { 
                        $set: { 
                            Justification_Text: justification,
                            keywords: keywords 
                        } 
                    }
                }
            });
        }
    }

    if (bulkOps.length > 0) {
      await Question.bulkWrite(bulkOps);
    }

    res.json({ 
      success: true, 
      message: `${generatedCount} questions were processed, and Justification/Keywords were generated by AI. Total processed: ${questions.length}`,
      count: generatedCount 
    });
  } catch (err) {
    console.error('❌ Error generating AI content:', err);
    res.status(500).json({ success: false, message: 'Server error during AI content generation: ' + err.message });
  }
});


// ✅ MODIFIED Verify Answer and Justification Route (Real-Time Grading)
const MIN_KEYWORD_OVERLAP_PERCENTAGE = 0.4; 

app.post('/verify-answer', async (req, res) => {
  console.log('✅ Verify Answer endpoint hit');
  const { qId, selectedOption, justification } = req.body; 
  
  try {
    const question = await Question.findById(qId);
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    const isCorrect = selectedOption === question.Correct_Option;
    let justificationScore = 0;
    let score = 0; 

    if (isCorrect) {
        score = 1; // Base point for correct answer

        // Proceed to check justification only if official keywords exist
        if (justification && question.keywords && question.keywords.length > 0) {
          // 1. Generate keywords from the user's justification (using local utility)
          const userKeywords = generateKeywords(justification);
          
          // 2. Find the intersection (overlap) between official and user keywords
          const officialKeywordsSet = new Set(question.keywords);
          let overlapCount = 0;
          for (const keyword of userKeywords) {
            if (officialKeywordsSet.has(keyword)) {
              overlapCount++;
            }
          }

          // 3. Calculate overlap percentage against the required keywords
          const overlapPercentage = overlapCount / question.keywords.length;

          // 4. Assign justification score based on overlap
          if (overlapPercentage >= MIN_KEYWORD_OVERLAP_PERCENTAGE) {
            justificationScore = 1; 
            score = 2; // Full score (Correct + Justification)
          } else {
            justificationScore = 0;
            // score remains 1 (Correct Answer Only)
          }
        }
    } else {
        score = 0; // Incorrect answer
    }

    // Response structure
    res.json({ 
      success: true, 
      isCorrect: isCorrect,
      justificationScore: justificationScore,
      totalScore: score,
      message: isCorrect ? 
        (justificationScore === 1 ? 'Correct answer with excellent justification!' : 'Correct answer, but justification was weak.') : 
        'Incorrect answer.',
      // Optional feedback for client side
      officialJustification: question.Justification_Text,
      requiredKeywords: question.keywords
    });
  } catch (err) {
    console.error('❌ Error verifying answer:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ------------------ Optional CSV/XLSX Upload ------------------
/* (Unchanged)
// Uncomment and install 'xlsx' if you need to bulk-import questions
const xlsx = require('xlsx');
async function uploadCSV() {
  try {
    const filePath = path.join(__dirname, 'questions.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    // Note: Ensure your CSV/XLSX column headers match your Mongoose schema exactly!
    await Question.insertMany(jsonData);
    console.log('✅ Data imported successfully');
  } catch (err) {
    console.error('❌ Error importing XLSX data:', err);
  }
}
*/

// ------------------ Start Server (Unchanged) ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
