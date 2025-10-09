// File: Home.js (FINAL CODE with Conditional Header and Improved Results CSS)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header"; // Import the central Header

// Utility function to get an appropriate placeholder image based on resource type
const getPlaceholderImage = (type) => {
    switch (type) {
        case 'YouTube':
            return 'https://placehold.co/100x60/FF0000/FFFFFF?text=YT';
        case 'Web Course':
            return 'https://placehold.co/100x60/007bff/FFFFFF?text=Course';
        case 'Resource':
            return 'https://placehold.co/100x60/6c757d/FFFFFF?text=Docs';
        case 'Course':
            return 'https://placehold.co/100x60/28a745/FFFFFF?text=ML';
        default:
            return 'https://placehold.co/100x60/343a40/FFFFFF?text=Link';
    }
}

// --- COURSE AND RESOURCE DEFINITION ---
const COURSE_RESOURCES = {
    'Beginner': {
        name: 'Python Fundamentals Crash Course',
        description: 'Start from absolute scratch! Master basic syntax, variables, loops, and functions.',
        links: [
            { type: 'YouTube', title: 'Python Full Course for Beginners (Mosh)', url: 'https://www.youtube.com/watch?v=K5KVEU3aaeQ' },
            { type: 'Web Course', title: 'Google Crash Course on Python (Coursera)', url: 'https://www.coursera.org/learn/python-crash-course' },
            { type: 'Resource', title: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/index.html' },
        ]
    },
    'Intermediate': {
        name: 'Core Data Structures & OOP',
        description: 'Deep dive into complex data types (sets, dictionaries, tuples) and Object-Oriented Programming (OOP) concepts.',
        links: [
            { type: 'YouTube', title: 'Corey Schafer Python OOP Series', url: 'https://www.youtube.com/@coreyms' },
            { type: 'Web Course', title: 'Intermediate Python Tutorials (Real Python)', url: 'https://realpython.com/tutorials/intermediate/' },
            { type: 'Course', title: 'Data Structures in Python (IBM/Coursera)', url: 'https://www.coursera.org/learn/python-for-applied-data-science-ai' },
        ]
    },
    'Advanced': {
        name: 'Concurrency, Data Science & APIs',
        description: 'Focus on high-performance topics like Asynchronous I/O (`asyncio`), multithreading, and leveraging data libraries.',
        links: [
            { type: 'Web Course', title: 'Learn Advanced Python 3: Concurrency (Codecademy)', url: 'https://www.codecademy.com/learn/learn-advanced-python-3-concurrency' },
            { type: 'Resource', title: 'Asyncio Documentation & Guide', url: 'https://docs.python.org/3/library/asyncio.html' },
            { type: 'Resource', title: 'Advanced Asyncio Deep Dive (Whatmaction)', url: 'https://whatmaction.com/blog/advanced-asynchronous-programming-in-python-with-asyncio-a-deep-dive-into-high-performance-concurrency/' },
        ]
    },
    'Expert/New Domain': {
        name: 'Machine Learning & Deployment',
        description: 'You are ready for advanced fields. Explore Machine Learning, Neural Networks, or cloud deployment (AWS/Azure).',
        links: [
            { type: 'Course', title: 'Data Scientist Master’s Program (Simplilearn)', url: 'https://www.simplilearn.com/data-scientist-masters-program-course' },
            { type: 'Resource', title: 'Practical Data Science with Python (Web)', url: 'https://www.datacamp.com/category/python' },
        ]
    }
};
// ----------------------------------------

export default function Home() {
  const TOTAL_QUESTIONS = 10;
  
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [justification, setJustification] = useState('');
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [justificationLoading, setJustificationLoading] = useState(false);

  useEffect(() => {
    // Session Protection Check: Redirect if not logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/'); 
      return; // Stop execution
    }

    async function loadQuestions() {
      try {
        const res = await fetch('http://localhost:5000/questions');
        const data = await res.json();
        if (data.success && data.questions.length === TOTAL_QUESTIONS) {
          setQuestions(data.questions);
        } else {
          setError(data.message || 'Failed to load a full set of questions. Please ensure you have at least 10 questions in your database, with a mix of difficulty levels.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching questions. Please make sure the backend is running and the database has enough questions.');
      }
    }
    loadQuestions();
  }, [navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.round((answers.length / TOTAL_QUESTIONS) * 100);

  const handleNext = async () => {
    // Ensure a selection and justification are present
    if (!currentQuestion || !selectedOption || !justification.trim()) { 
           alert('Please select an option and provide a justification.');
           return;
       }
    
    setJustificationLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const res = await fetch('http://localhost:5000/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qId: currentQuestion._id,
          selectedOption,
          justification,
        }),
      });

      if (!res.ok) {
        const errorText = await res.json().then(data => data.message || 'Unknown Error').catch(() => 'Non-JSON error response.');
        throw new Error(`Server responded with status: ${res.status}. Message: ${errorText}`);
      }
      
      const data = await res.json();
      
      setAnswers(prev => [
        ...prev,
        {
          qId: currentQuestion._id,
          selected: selectedOption,
          selectedJustification: justification,
          correct: data.isCorrect,
          
          isJustificationRelevant: data.justificationScore === 1, 
          totalScore: data.totalScore, 
          feedbackMessage: data.message, 
          officialKeywords: data.requiredKeywords, 
          officialJustification: data.officialJustification, 
              
          difficulty: currentQuestion.DifficultyLevel,
        },
      ]);
      setSelectedOption('');
      setJustification('');
      setJustificationLoading(false);
      
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < TOTAL_QUESTIONS) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        setFinished(true);
      }
      
    } catch (err) {
      console.error('Error verifying answer:', err);
      setError('Failed to verify answer. Check the console for details.');
      setJustificationLoading(false);
    }
  };

  if (error) {
    // Show minimal error interface, header is omitted
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl text-center" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      </div>
    );
  }
  if (questions.length === 0 && !finished) {
    // Show minimal loading interface, header is omitted
    return <p className="text-gray-600 text-center mt-8">Loading questions…</p>;
  }

  if (finished) {
    const correctCount = answers.filter(a => a.correct).length;
    
    // Calculate total score and percentage
    const totalPossibleScore = TOTAL_QUESTIONS * 2;
    const finalScore = answers.reduce((sum, a) => sum + a.totalScore, 0);
    const scorePercentage = (finalScore / totalPossibleScore) * 100;

    // --- COURSE RECOMMENDATION LOGIC ---
    let recommendedKey;
    let recommendationColor;
    
    if (scorePercentage >= 90) {
        recommendedKey = 'Expert/New Domain'; 
        recommendationColor = 'bg-purple-100 border-purple-500 text-purple-700';
    } else if (scorePercentage >= 65) {
        recommendedKey = 'Advanced';
        recommendationColor = 'bg-yellow-100 border-yellow-500 text-yellow-700';
    } else if (scorePercentage >= 30) {
        recommendedKey = 'Intermediate';
        recommendationColor = 'bg-blue-100 border-blue-500 text-blue-700';
    } else {
        recommendedKey = 'Beginner';
        recommendationColor = 'bg-red-100 border-red-500 text-red-700';
    }
    
    const course = COURSE_RESOURCES[recommendedKey];
    // ------------------------------------

    const relevantJustificationCount = answers.filter(a => a.isJustificationRelevant).length;
    const correctDifficulties = answers.filter(a => a.correct).map(a => a.difficulty);
    let level = 'Beginner';
    if (correctDifficulties.includes('Advanced')) level = 'Advanced';
    else if (correctDifficulties.includes('Intermediate')) level = 'Intermediate';

    const handleRetake = () => {
      window.location.reload();
    };

    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* 📢 SHOW HEADER ONLY ON RESULTS PAGE */}
        <Header /> 
        
        {/* New main content wrapper for better spacing and alignment */}
        <div className="flex flex-col items-center flex-grow p-4 md:p-12">
            <div className="w-full max-w-4xl text-center">

                <h1 className="text-3xl font-bold text-gray-800 mb-6 mt-10">Quiz Results</h1>

                <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                        {/* Score Circle SVG */}
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path
                                className="text-gray-200"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-blue-500"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="none"
                                strokeDasharray={`${scorePercentage}, 100`}
                                strokeLinecap="round"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-700">
                                {finalScore} / {totalPossibleScore}
                            </span>
                            <span className="text-sm text-gray-500">Points</span>
                        </div>
                    </div>
                </div>
                
                {/* --- COURSE RECOMMENDATION DISPLAY --- */}
                <div className={`w-full max-w-md mx-auto p-4 mt-6 rounded-lg border-l-4 border-b-4 shadow-md ${recommendationColor}`}>
                    <h3 className="text-xl font-bold">🎯 Your Next Step:</h3>
                    <p className="text-lg mt-1 mb-3 text-left">
                        Based on your **{scorePercentage.toFixed(0)}% score**, we recommend starting with our **{course.name}** course!
                    </p>
                    <p className="font-semibold text-base mb-1 text-left">Resources:</p>
                    <div className="space-y-3 mt-2">
                        {course.links.map((link, index) => (
                            <a 
                                key={index} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition duration-200"
                            >
                                <img 
                                    src={getPlaceholderImage(link.type)}
                                    alt={link.type} 
                                    className="w-12 h-8 object-cover rounded-md mr-3"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x60/343a40/FFFFFF?text=Link'; }}
                                />
                                <div className="flex flex-col text-left">
                                    <span className="font-medium text-sm text-gray-800">{link.title}</span>
                                    <span className="text-xs text-blue-600">{link.type} Resource</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
                
                <p className="text-xl font-semibold mt-6 mb-2">You had {correctCount} correct answers.</p>
                <p className="text-xl font-semibold mb-2">You fully justified {relevantJustificationCount} answers.</p>
                <h2 className="text-xl font-semibold mb-8">Your Level: {recommendedKey}</h2>

                {/* Question breakdown section */}
                <div className="w-full space-y-6 mb-8">
                    {answers.map((a, idx) => {
                        const q = questions.find(q => q._id === a.qId);
                        if (!q) return null;

                        // Determine the background color for the justification section
                        const justificationBgColor = a.isJustificationRelevant ? '#d1e7dd' : (a.correct ? '#ffecb3' : '#f8d7da');
                        const justificationFeedbackText = a.isJustificationRelevant ? 'Relevant keywords found. (+1 Justification Point)' : (a.correct ? 'Justification was weak. (0 Justification Points)' : 'Justification irrelevant as answer was wrong.');


                        return (
                            <div
                                key={a.qId}
                                className="p-6 border rounded-xl bg-white shadow-lg text-left" 
                            >
                                <p className="font-semibold text-lg mb-2 text-gray-800">
                                    Q{idx + 1}. {q.Question}
                                    <span className={`ml-3 px-3 py-1 text-sm rounded-full font-bold ${a.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        {a.totalScore} / 2 Points
                                    </span>
                                </p>
                                <div className="space-y-2 mb-4">
                                    {['Option1', 'Option2', 'Option3', 'Option4'].map(optKey => {
                                        let className = 'block border rounded-lg p-3 transition-colors text-gray-800';
                                        const isCorrect = optKey === q.Correct_Option;
                                        const isSelected = optKey === a.selected;

                                        if (isCorrect) {
                                            className += ' bg-green-100 border-green-500 font-semibold';
                                        } else if (isSelected) {
                                            className += ' bg-red-100 border-red-500';
                                        } else {
                                            className += ' border-gray-300';
                                        }
                                        
                                        return (
                                            <div key={optKey} className={className}>
                                                {q[optKey]}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="mb-4">
                                    <p className="font-medium text-gray-600">Your Justification:</p>
                                    <p className="italic text-gray-800 p-2 bg-gray-50 rounded-md">
                                        {a.selectedJustification}
                                    </p>
                                </div>
                                
                                <div className="p-4 rounded-lg border" style={{ backgroundColor: justificationBgColor }}>
                                    <p className="font-semibold text-gray-800 mb-1">Feedback: {justificationFeedbackText}</p>
                                    <p className="font-medium text-gray-600">Official Justification:</p>
                                    <p className="text-gray-700 italic mb-2">{a.officialJustification || 'No official explanation provided.'}</p>
                                    <p className="font-medium text-gray-600">Required Keywords:</p>
                                    <p className="mt-1 text-gray-700">{a.officialKeywords && a.officialKeywords.length > 0 ? a.officialKeywords.join(', ') : 'No keywords found.'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleRetake}
                    className="bg-green-500 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-600 transition duration-300"
                >
                    Retake Quiz
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-blue-500 h-2 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 text-center mt-2">
        {answers.length} / {TOTAL_QUESTIONS} Questions
      </p>
      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Question {answers.length + 1} of {TOTAL_QUESTIONS}
          </h2>
          <p className="mb-6 text-gray-800">{currentQuestion.Question}</p>
          <form>
            {['Option1', 'Option2', 'Option3', 'Option4'].map(optKey => (
              <label
                key={optKey}
                className={`block border rounded-lg p-4 mb-4 cursor-pointer transition-colors ${
                  selectedOption === optKey
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={optKey}
                  checked={selectedOption === optKey}
                  onChange={e => setSelectedOption(e.target.value)}
                  className="mr-3 form-radio text-blue-500"
                />
                {currentQuestion[optKey]}
              </label>
            ))}
          </form>
          <div className="mt-4">
            <label className="block text-gray-700 font-semibold mb-2">Justify your answer:</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows="4"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Explain why you chose this option..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedOption || !justification.trim() || justificationLoading}
              className="mt-4 bg-blue-500 text-white py-2 px-5 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {justificationLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}