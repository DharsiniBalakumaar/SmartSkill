// File: Home.js (FINAL UPDATED CODE)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";

// Utility function unchanged
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
};

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

const NEXT_LEVEL_MAP = {
    'Beginner': { correct: 'Intermediate', incorrect: 'Beginner' },
    'Intermediate': { correct: 'Advanced', incorrect: 'Beginner' },
    'Advanced': { correct: 'Advanced', incorrect: 'Intermediate' }
};

const ScoreChart = ({ answers, totalQuestions }) => {
    const WIDTH = 300, HEIGHT = 200, PADDING = 20;
    const MAX_POSITIVE_SCORE = totalQuestions * 2.0;
    const MAX_NEGATIVE_SCORE = totalQuestions * -0.5;
    const SCORE_RANGE = MAX_POSITIVE_SCORE - MAX_NEGATIVE_SCORE;
    let cumulativeScore = 0;
    const dataPoints = answers.map((answer, index) => {
        cumulativeScore += answer.totalScore;
        const x = PADDING + (index + 1) * ((WIDTH - 2 * PADDING) / totalQuestions);
        const normalizedScore = (cumulativeScore - MAX_NEGATIVE_SCORE) / SCORE_RANGE;
        const y = HEIGHT - PADDING - normalizedScore * (HEIGHT - 2 * PADDING);
        return { x, y, score: cumulativeScore, totalScore: answer.totalScore };
    });
    const zeroScoreYStart = HEIGHT - PADDING - ((0 - MAX_NEGATIVE_SCORE) / SCORE_RANGE) * (HEIGHT - 2 * PADDING);
    dataPoints.unshift({ x: PADDING, y: zeroScoreYStart, score: 0, totalScore: 0 });
    const zeroScoreY = HEIGHT - PADDING - ((0 - MAX_NEGATIVE_SCORE) / SCORE_RANGE) * (HEIGHT - 2 * PADDING);
    const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return (
        <div className="md:w-1/3 w-full p-4 bg-white rounded-lg shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-2 text-center">Adaptive Progress 📈</h3>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT}>
                <line x1={PADDING} y1={PADDING} x2={WIDTH - PADDING} y2={PADDING} stroke="#d1e7dd" strokeDasharray="4" strokeWidth="1" />
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {dataPoints.slice(1).map((p, index) => (
                    <circle key={index} cx={p.x} cy={p.y} r="4" fill={p.totalScore > 0 ? '#22c55e' : '#dc2626'} stroke="#fff" strokeWidth="1.5" />
                ))}
                <text x={0} y={PADDING + 5} fontSize="10" fill="#22c55e" textAnchor="start" fontWeight="bold">{MAX_POSITIVE_SCORE.toFixed(1)} Pts (Max)</text>
                <text x={0} y={zeroScoreY + 5} fontSize="10" fill="#666" textAnchor="start">0.0 Pts</text>
                <text x={0} y={HEIGHT - PADDING + 5} fontSize="10" fill="#dc2626" textAnchor="start" fontWeight="bold">{MAX_NEGATIVE_SCORE.toFixed(1)} Pts (Min)</text>
            </svg>
            <p className="text-center text-sm text-gray-700 mt-2 font-semibold">
                Current Score: {dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].score.toFixed(1) : '0.0'} / {answers.length * 2} Pts
            </p>
        </div>
    );
};

export default function Home() {
    const TOTAL_QUESTIONS = 10;
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [justification, setJustification] = useState('');
    const [answers, setAnswers] = useState([]);
    const [finished, setFinished] = useState(false);
    const [justificationLoading, setJustificationLoading] = useState(false);
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // 1. Hook for fetching the next question (Correctly placed)
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            navigate('/');
            return;
        }
        if (finished || answers.length >= TOTAL_QUESTIONS) {
            setFinished(true);
            return;
        }
        async function loadNextQuestion() {
            try {
                const res = await fetch(`http://localhost:5000/next-question?level=${skillLevel}`);
                const data = await res.json();
                if (data.success && data.question) {
                    setCurrentQuestion(data.question);
                } else {
                    setError(data.message || 'Failed to load next question. Check server logs.');
                }
            } catch (err) {
                setError('Error fetching question. Please make sure the backend is running and the new /next-question route is implemented.');
            }
        }
        if (!justificationLoading && !currentQuestion) {
            loadNextQuestion();
        }
    }, [navigate, skillLevel, answers.length, finished]);

    // 2. PROGRESS SAVING HOOK (Correctly placed, handles side-effect)
    useEffect(() => {
        // Only run when the quiz is definitively finished and all questions are answered
        if (finished && answers.length === TOTAL_QUESTIONS) {
            // Recalculate variables needed for the API call (safe now)
            const totalPossibleScore = TOTAL_QUESTIONS * 2;
            const finalScore = answers.reduce((sum, a) => sum + a.totalScore, 0);
            const scorePercentage = (finalScore / totalPossibleScore) * 100;
            let recommendedKey;
            
            if (scorePercentage >= 90) {
                recommendedKey = 'Expert/New Domain';
            } else if (scorePercentage >= 65) {
                recommendedKey = 'Advanced';
            } else if (scorePercentage >= 30) {
                recommendedKey = 'Intermediate';
            } else {
                recommendedKey = 'Beginner';
            }
            const course = COURSE_RESOURCES[recommendedKey];

            const token = localStorage.getItem('authToken');
            async function saveProgress() {
                try {
                    const res = await fetch('http://localhost:5000/progress/save', { // <-- NOW AWAITED
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token,
                            totalScore: finalScore,
                            totalPossibleScore,
                            scorePercentage,
                            recommendedLevel: recommendedKey,
                            recommendedCourse: course,
                            answers,
                        })
                    });

                    if (!res.ok) {
                        console.error('Failed to save progress on server.');
                    }
                } catch (err) {
                    console.error('Network or server error during progress save:', err);
                }
            }
            saveProgress();
        }
    // eslint-disable-next-line
    }, [finished, answers.length]);

    const progressPercent = Math.round((answers.length / TOTAL_QUESTIONS) * 100);

    const handleNext = async () => {
        if (!currentQuestion || !selectedOption || !justification.trim()) {
            alert('Please select an option and provide a justification.');
            return;
        }
        setJustificationLoading(true);
        setError('');
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
            const newAnswer = {
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
                Question: currentQuestion.Question,
                Option1: currentQuestion.Option1,
                Option2: currentQuestion.Option2,
                Option3: currentQuestion.Option3,
                Option4: currentQuestion.Option4,
                Correct_Option: currentQuestion.Correct_Option,
            };
            setAnswers(prev => [...prev, newAnswer]);
            setSelectedOption('');
            setJustification('');
            setCurrentQuestion(null);

            const answeredDifficulty = currentQuestion.DifficultyLevel;
            let nextLevel = skillLevel;
            if (answeredDifficulty === 'Expert/New Domain') {
                nextLevel = skillLevel;
            } else {
                const difficultyMap = NEXT_LEVEL_MAP[answeredDifficulty] || NEXT_LEVEL_MAP['Beginner'];
                nextLevel = data.isCorrect && data.justificationScore === 1 ? difficultyMap.correct : difficultyMap.incorrect;
            }
            setSkillLevel(nextLevel);
            setJustificationLoading(false);

            if (answers.length + 1 >= TOTAL_QUESTIONS) {
                setFinished(true);
            }
        } catch (err) {
            setError('Failed to verify answer. Check the console for details.');
            setJustificationLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl text-center" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        );
    }

    if (!currentQuestion && !finished) {
        return <p className="text-gray-600 text-center mt-8">Loading question {answers.length + 1} ({skillLevel} level)…</p>;
    }

    if (finished) {
        const totalPossibleScore = TOTAL_QUESTIONS * 2;
        const finalScore = answers.reduce((sum, a) => sum + a.totalScore, 0);
        const scorePercentage = (finalScore / totalPossibleScore) * 100;
        let recommendedKey;
        if (scorePercentage >= 90) {
            recommendedKey = 'Expert/New Domain';
        } else if (scorePercentage >= 65) {
            recommendedKey = 'Advanced';
        } else if (scorePercentage >= 30) {
            recommendedKey = 'Intermediate';
        } else {
            recommendedKey = 'Beginner';
        }
        const course = COURSE_RESOURCES[recommendedKey];
        const relevantJustificationCount = answers.filter(a => a.isJustificationRelevant).length;
        const handleRetake = () => { window.location.reload(); };

        // ❌ REMOVED THE NESTED useEffect HOOK HERE
        
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <div className="flex flex-col items-center flex-grow p-4 md:p-12">
                    <div className="w-full max-w-4xl text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6 mt-10">Quiz Results</h1>
                        <p className="text-xl font-semibold mt-6 mb-2">
                            Final Score: {finalScore.toFixed(1)} / {totalPossibleScore} Points
                        </p>
                        <p className="text-xl font-semibold mb-2">
                            You demonstrated {relevantJustificationCount} relevant justifications.
                        </p>
                        <h2 className="text-xl font-semibold mb-2">
                            Your Recommended Next Step: {recommendedKey}
                        </h2>
                        {/* --- Recommended Course Card Section --- */}
                        <div className="mb-8">
                            <div className="text-lg font-bold mb-2 text-gray-800">{course.name}</div>
                            <p className="text-gray-700 mb-4">{course.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                                {course.links.map((res, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white hover:shadow-2xl shadow-lg border border-gray-200 rounded-xl p-4 cursor-pointer flex flex-col items-center transition duration-200 ease-in-out"
                                        onClick={() => window.open(res.url, "_blank")}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Open ${res.title}`}
                                    >
                                        <img
                                            src={getPlaceholderImage(res.type)}
                                            alt={res.type}
                                            className="mb-2 rounded w-20 h-14 object-contain"
                                        />
                                        <div className="font-semibold text-blue-700 text-base mb-1 whitespace-normal text-center">
                                            {res.title}
                                        </div>
                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs text-gray-600">
                                            {res.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* --- End Course Resource Card Section --- */}

                        {/* --- Answer Breakdown Section --- */}
                        <div className="w-full space-y-6 mb-8">
                            {answers.map((a, idx) => {
                                const justificationBgColor = a.isJustificationRelevant
                                    ? '#d1e7dd'
                                    : (a.correct ? '#ffecb3' : '#f8d7da');
                                const justificationFeedbackText =
                                    a.totalScore === 2.0
                                        ? 'Answer and justification fully correct. (+2.0 Total Score)'
                                        : 'Answer wrong or justification failed criteria. (-0.5 Penalty)';
                                return (
                                    <div
                                        key={a.qId}
                                        className="p-6 border rounded-xl bg-white shadow-lg text-left"
                                    >
                                        <p className="font-semibold text-lg mb-2 text-gray-800">
                                            Q{idx + 1}. {a.Question}
                                            <span className={`ml-3 px-3 py-1 text-sm rounded-full font-bold ${a.totalScore > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                {a.totalScore.toFixed(1)} Points
                                            </span>
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            {['Option1', 'Option2', 'Option3', 'Option4'].map(optKey => {
                                                let className = 'block border rounded-lg p-3 transition-colors text-gray-800';
                                                const isCorrect = optKey === a.Correct_Option;
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
                                                        {a[optKey]}
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
                        {/* --- End Breakdown --- */}

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
                <div className="bg-blue-500 h-2 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
                {answers.length} / {TOTAL_QUESTIONS} Questions (Current Level: <span className="font-bold">{skillLevel}</span>)
            </p>
            <div className="flex-1 flex flex-col md:flex-row items-start justify-center pt-8 px-4 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl md:w-2/3 lg:w-1/2">
                    <h2 className="text-xl font-semibold mb-4">
                        Question {answers.length + 1} of {TOTAL_QUESTIONS}
                    </h2>
                    <p className="mb-6 text-gray-800">{currentQuestion.Question}</p>
                    <form>
                        {['Option1', 'Option2', 'Option3', 'Option4'].map(optKey => (
                            <label
                                key={optKey}
                                className={`block border rounded-lg p-4 mb-4 cursor-pointer transition-colors ${
                                    selectedOption === optKey ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
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
                <ScoreChart answers={answers} totalQuestions={TOTAL_QUESTIONS} />
            </div>
        </div>
    );
}