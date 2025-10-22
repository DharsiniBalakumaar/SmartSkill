// File: smartskillBackend/index.js (Updated with STRICT Binary Scoring and Penalty)

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
// --------------------------

dotenv.config(); 

// --- DEBUG: Check Environment Variable ---
console.log('OpenRouter Key Loaded?', !!process.env.OPENROUTER_API_KEY); 
// -----------------------------------------

// ------------------ AI Initialization (OpenRouter Setup) ------------------
//const ai = new OpenAI({ 
//    apiKey: process.env.OPENROUTER_API_KEY, 
//    baseURL: 'https://openrouter.ai/api/v1', 
//});
// --------------------------------------------------------------------------

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

// ------------------ Python ML Utility Function ------------------
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

        pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            try {
                const result = JSON.parse(pythonOutput);
                if (result && result.success && result.difficulty) {
                    resolve(result.difficulty);
                } else {
                    resolve('Advanced');
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

// ------------------ Authentication Routes ------------------
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
    
    // CRITICAL CHANGE: Use email as the token for simple lookup
    const userEmailAsToken = user.email; 
    res.json({ 
        success: true, 
        message: 'Login successful',
        token: userEmailAsToken, // Stores email in local storage as authToken
        username: user.username
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/next-question', async (req, res) => {
    console.log('❓ Next Question endpoint hit');
    const { level } = req.query; 

    let difficultyToFetch = 'Beginner'; 

    if (level === 'Intermediate' || level === 'intermediate') {
        difficultyToFetch = 'Intermediate'; 
    } else if (level === 'Advanced' || level === 'advanced') {
        difficultyToFetch = 'Advanced'; 
    } else if (level === 'Expert/New Domain' || level === 'expert/new domain') {
        difficultyToFetch = 'Expert/New Domain';
    }

    try {
        const questions = await Question.aggregate([
            { $match: { DifficultyLevel: difficultyToFetch } }, 
            { $sample: { size: 1 } } 
        ]);

        if (questions.length === 0) {
            const fallbackQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
            if (fallbackQuestion.length > 0) {
                return res.json({ success: true, question: fallbackQuestion[0] });
            }
            return res.status(404).json({ success: false, message: `No questions found for level: ${difficultyToFetch}.` });
        }
        
        res.json({ success: true, question: questions[0] }); 

    } catch (err) {
        console.error('❌ Error fetching next question:', err);
        res.status(500).json({ success: false, message: 'Server error fetching questions.' });
    }
});


// STRONG/RELIABLE STRICT KEYWORD LOGIC + BINARY SCORING (+2.0 or -0.5 ONLY)
app.post('/verify-answer', async (req, res) => {
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

        // Always use the stored "key keywords" as the strict, reliable set
        const reliableKeywords = Array.isArray(question.keywords) && question.keywords.length ? question.keywords.map(k => String(k).toLowerCase().trim()) : [];
        // Extract user justification keywords (should be array, lowercased)
        let userKeywords = Array.isArray(justification) ? justification : generateKeywords(justification || '');
        userKeywords = userKeywords.map(k => String(k).toLowerCase().trim());
        let matchedKeywords = [];

        if (reliableKeywords.length > 0) {
            const keywordSet = new Set(reliableKeywords);
            matchedKeywords = userKeywords.filter(k => keywordSet.has(k));
        }

        // STRONG mark: must have BOTH correct option and at least 3 valid keywords to score full marks
        let totalScore = -0.5;
        let isJustificationRelevant = false;
        let justificationMessage = 'Answer wrong or justification did not demonstrate sufficient conceptual relevance.';

        if (isCorrect && matchedKeywords.length >= 3) {
            // Award only if both: correct answer, AND at least 3 good keywords
            totalScore = 2.0;
            isJustificationRelevant = true;
            justificationMessage = 'Answer and justification are fully correct! (+2.0)';
        }

        return res.json({
            success: true,
            isCorrect,
            justificationScore: isJustificationRelevant ? 1 : 0,
            totalScore,
            message: justificationMessage,
            matchedKeywords,
            requiredKeywords: reliableKeywords,
            officialJustification,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
    }
});

app.post('/progress/save', async (req, res) => {
  // POST body must include token, totalScore, totalPossibleScore, scorePercentage, recommendedLevel, recommendedCourse, answers
  const { token, totalScore, totalPossibleScore, scorePercentage, recommendedLevel, recommendedCourse, answers } = req.body;
  try {
    // Find user by your session token logic. Adjust for real JWT/session logic as needed.
    // CRITICAL CHANGE: Use token (assumed to be email) to find user
    const user = await User.findOne({ email: token });
    if (!user) return res.status(401).json({ success: false, message: 'User not authorized' });

    if (!user.progress) {
        user.progress = [];
    }

    user.progress.push({
      quizDate: new Date(),
      totalScore,
      totalPossibleScore,
      scorePercentage,
      recommendedLevel,
      recommendedCourse,
      answers
    });

    await user.save();
    console.log(`✅ Progress saved for user: ${user.email}. Score: ${totalScore}`);
    res.json({ success: true, message: 'Progress saved', progress: user.progress[user.progress.length - 1] });
  } catch (err) {
    console.error('❌ Error saving progress:', err);
    res.status(500).json({ success: false, message: 'Error saving progress' });
  }
});

app.get('/dashboard/progress', async (req, res) => {
  // Accept token from query or session, use your auth logic
  const { token } = req.query;
  try {
    const user = await User.findOne({ email: token });
    if (!user) return res.status(401).json({ success: false, message: 'User not found or token invalid' });
    
    // Ensure progress is an array, even if empty
    const progress = user.progress || []; 
    console.log(`📊 Dashboard fetched for user: ${user.email}. Found ${progress.length} records.`);
    
    res.json({ success: true, progress: progress });
  } catch (err) {
    console.error('❌ Error fetching dashboard:', err);
    res.status(500).json({ success: false, message: 'Error fetching dashboard' });
  }
});



// ✅ Tutor Chatbot Route (Unchanged)
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

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));