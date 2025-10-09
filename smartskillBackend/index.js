// File: smartskillBackend/index.js (FINAL, COMPLETE CODE with OpenRouter)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const { spawn } = require('child_process'); 


const Question = require('./models/Questions');
const User = require('./models/User');

// --- AI/Keyword Imports ---
const generateKeywords = require('./utils/keywordGenerator'); 
//const generateOfficialContent = require('./utils/geminiContentGenerator'); 
//const { OpenAI } = require('openai'); 
// --------------------------

dotenv.config(); 

// --- DEBUG: Check Environment Variable ---
console.log('OpenRouter Key Loaded?', !!process.env.OPENROUTER_API_KEY); 
// -----------------------------------------

// ------------------ AI Initialization (OpenRouter Setup) ------------------
//const ai = new OpenAI({ 
  //  apiKey: process.env.OPENROUTER_API_KEY, 
    //baseURL: 'https://openrouter.ai/api/v1', 
//});
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
async function runPythonPrediction(question) {
    return new Promise((resolve) => {
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'predict_difficulty.py'),
            question
        ]);

        let pythonOutput = '';
        pythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString();
        });

        // Handle stderr if needed (logging only)
        pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            try {
                const result = JSON.parse(pythonOutput);
                if (result && result.success && result.difficulty) {
                    resolve(result.difficulty);
                } else {
                    resolve('Advanced'); // fallback
                }
            } catch (err) {
                console.error('Python result parse error:', err, pythonOutput);
                resolve('Advanced');
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('Python Spawn Error:', err);
            resolve('Advanced');
        });
    });
}

// ----------------------------------------------------------------

// ------------------ Authentication Routes ------------------

// ✅ Registration Route (Unchanged)
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

// ✅ Login Route (FIXED to return token and username)
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
    
    // --- 📢 FIX APPLIED HERE ---
    const mockToken = crypto.randomBytes(16).toString('hex'); // Mock token (replace with JWT)
    res.json({ 
        success: true, 
        message: 'Login successful',
        token: mockToken, // Provide a token
        username: user.username // Provide the username
    });
    // -------------------------
    
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get 10 random or fixed questions (Unchanged)
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


// 🚀 CRITICAL FIX: /verify-answer ROUTE - NOW COMPLETELY AVOIDS BUGGY AI CALL
app.post('/verify-answer', async (req, res) => {
  console.log('✅ Verify Answer endpoint hit (Local Processing)');
  const { qId, selectedOption, justification } = req.body;

  if (!qId || !selectedOption) {
    return res.status(400).json({ success: false, message: 'Missing question ID or selection.' });
  }

  try {
    const question = await Question.findById(qId).lean();
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const isCorrect = String(question.Correct_Option) === String(selectedOption);
    const officialJustification = question.Justification_Text || 'Official justification is missing from the database.';
    const requiredKeywords = Array.isArray(question.keywords) && question.keywords.length
      ? question.keywords.map(k => String(k).toLowerCase().trim())
      : ['concept'];

    // 1) Extract keywords from user's justification using local extractor
    const userKeywords = Array.isArray(justification) ? justification : generateKeywords(justification || '');

    // normalized user keywords
    const normalizedUserKeywords = userKeywords.map(k => k.toLowerCase().trim());
    const requiredSet = new Set(requiredKeywords);

    // matched keywords (intersection)
    const matchedKeywords = normalizedUserKeywords.filter(k => requiredSet.has(k));

    // scoring: base point for correctness, +1 for justification match
    let justificationScore = 0;
    let totalScore = isCorrect ? 1 : 0;
    let justificationMessage = isCorrect ? 'Answer is correct.' : 'Answer is incorrect.';

    if (isCorrect) {
    // Give full credit if at least half (rounded up) of the required keywords are present
    const minKeywordsRequired = Math.ceil(requiredKeywords.length / 2);
    if (matchedKeywords.length >= minKeywordsRequired) {
        justificationScore = 1;
        totalScore += 1;
        justificationMessage = 'Answer is correct and justification is highly relevant!';
    } else if (matchedKeywords.length > 0) {
        justificationScore = 0; // or set 0.5 if you want half point for some matches
        justificationMessage = `Answer is correct, but only some relevant keywords were mentioned (${matchedKeywords.length}/${requiredKeywords.length}).`;
    } else {
        justificationMessage = 'Answer is correct, but the justification misses required keywords.';
    }
    }


    return res.json({
      success: true,
      isCorrect,
      justificationScore,
      totalScore,
      message: justificationMessage,
      matchedKeywords,
      requiredKeywords: question.keywords || requiredKeywords,
      officialJustification,
    });
  } catch (err) {
    console.error('❌ Error verifying answer:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
});



// ✅ Tutor Chatbot Route (Temporary Local Mock)
app.post("/chat/tutor", async (req, res) => {
    console.log("💬 /chat/tutor hit");

    const { userQuery, history } = req.body;
    if (!userQuery) {
        return res.status(400).json({ success: false, message: "Missing user query" });
    }

    try {
        // UPDATED: Use the ML-based model, not heuristic!
        const predictedLevel = await runPythonPrediction(userQuery);

        // Compose messages for OpenRouter
        const messages = [
            { role: "system", content: "You are an intelligent tutor that explains coding, logic, and concepts clearly." },
            ...(Array.isArray(history) ? history : []),
        ];
        // Optionally add current userQuery if not included
        if (!messages.length || messages[messages.length - 1].content !== userQuery) {
            messages.push({ role: "user", content: userQuery });
        }

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: messages,
            }),
        });

        // Check if OpenRouter gave a meaningful response
        if (!openRouterResponse.ok) {
            let errorText = "Unknown error";
            try {
                const errorData = await openRouterResponse.json();
                errorText = errorData?.error?.message || JSON.stringify(errorData);
            } catch (e) { }
            console.error("OpenRouter API error:", errorText);
            return res.status(500).json({
                success: false,
                message: `OpenRouter API error: ${errorText}`,
            });
        }

        const data = await openRouterResponse.json();

        const tutorResponse =
            data?.choices?.[0]?.message?.content ||
            "I’m sorry, I couldn’t generate a response at the moment.";

        return res.json({
            success: true,
            predictedLevel,
            tutorResponse,
        });

    } catch (err) {
        console.error("❌ ChatTutor Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ------------------ Start Server (Unchanged) ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));