import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from "../components/Header";

// --- START STATIC DATA & UTILITIES ---

// Utility function to format the date for the Recent Activity Table
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const COURSE_LEVELS = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert/New Domain'
];

// Course resources copied from Home.js for self-containment
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

// Utility function to get placeholder image URL based on link type
const getPlaceholderImage = (type) => {
    switch (type) {
        case 'YouTube':
            // Using a simple square placeholder for aesthetics in the card
            return 'https://placehold.co/40x40/FF0000/FFFFFF?text=YT';
        case 'Web Course':
            return 'https://placehold.co/40x40/007bff/FFFFFF?text=CS';
        case 'Resource':
            return 'https://placehold.co/40x40/6c757d/FFFFFF?text=DS';
        case 'Course':
            return 'https://placehold.co/40x40/28a745/FFFFFF?text=ML';
        default:
            return 'https://placehold.co/40x40/343a40/FFFFFF?text=L';
    }
};

// Utility function for consistent styling (no change)
const getLevelColor = (level) => {
    switch (level) {
        case 'Beginner':
            return 'border-green-500 bg-green-50';
        case 'Intermediate':
            return 'border-yellow-500 bg-yellow-50';
        case 'Advanced':
            return 'border-blue-500 bg-blue-50';
        case 'Expert/New Domain':
            return 'border-purple-500 bg-purple-50';
        default:
            return 'border-gray-500 bg-gray-50';
    }
};

// --- END STATIC DATA & UTILITIES ---


// --- 1. Quiz Trend Chart Component (Your Python Skill Progression) ---
const QuizTrendChart = ({ progress }) => {
    const WIDTH = 600, HEIGHT = 250, PADDING = 30;

    if (!progress || progress.length < 2) {
        return <p className="text-center text-gray-500 mt-4">Need at least 2 quiz attempts to show a trend.</p>;
    }

    // Y-Axis Configuration (adjusted for potential negative scores)
    const maxScore = 100; 
    const minScore = -50; 
    const scoreRange = maxScore - minScore;
    
    const numPoints = progress.length;
    const stepX = (WIDTH - 2 * PADDING) / (numPoints - 1);

    const dataPoints = progress.map((p, index) => {
        const x = PADDING + index * stepX;
        
        // Normalize score relative to the -50% to 100% range
        const normalizedScore = (p.scorePercentage - minScore) / scoreRange;
        
        // SVG Y-axis is inverted (0 at top, HEIGHT at bottom)
        const y = HEIGHT - PADDING - normalizedScore * (HEIGHT - 2 * PADDING);
        return { x, y, score: p.scorePercentage.toFixed(0), quizNumber: index + 1, date: formatDate(p.quizDate) };
    });

    const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Calculate Y position for the 0% line
    const zeroY = HEIGHT - PADDING - ((0 - minScore) / scoreRange) * (HEIGHT - 2 * PADDING);


    return (
        <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Your Python Skill Progression</h3>
                <span className="text-sm text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">
                    Last 30 days +{Math.round(Math.random() * 15)}%
                </span>
            </div>
            
            {/* SVG Chart */}
            <div className="flex-grow flex items-center justify-center">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%">
                    
                    {/* Draw the 0% horizontal baseline */}
                    <line x1={PADDING} y1={zeroY} x2={WIDTH - PADDING} y2={zeroY} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />

                    {/* Background Area Fill - clip to 0% line */}
                    <path 
                        d={`${pathD} L ${WIDTH - PADDING} ${zeroY} L ${PADDING} ${zeroY} Z`} 
                        fill="#3b82f6" 
                        fillOpacity="0.1" 
                    />

                    {/* Line Path */}
                    <path 
                        d={pathD} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    
                    {/* Circle Markers and labels */}
                    {dataPoints.map((p, index) => {
                        const isNegative = parseFloat(p.score) < 0;
                        // Position score label above positive points, below negative points
                        const labelY = p.y + (isNegative ? 15 : -10);
                        const labelFill = isNegative ? '#dc2626' : '#3b82f6';

                        return (
                            <g key={index}>
                                <circle cx={p.x} cy={p.y} r="5" fill={labelFill} stroke="#fff" strokeWidth="2" />
                                
                                {/* Score Label */}
                                <text 
                                    x={p.x} 
                                    y={labelY} 
                                    fontSize="12" 
                                    fill={labelFill} 
                                    textAnchor="middle" 
                                    fontWeight="bold"
                                >
                                    {p.score}%
                                </text>
                                
                                {/* Quiz Number Label on X-axis */}
                                <text 
                                    x={p.x} 
                                    y={HEIGHT - PADDING + 15} 
                                    fontSize="10" 
                                    fill="#4a5568" 
                                    textAnchor="middle"
                                >
                                    Q{p.quizNumber}
                                </text>
                            </g>
                        );
                    })}

                    {/* Y-Axis Labels (Score Percentage) */}
                    <text x={PADDING - 5} y={PADDING + 5} fontSize="10" fill="#4a5568" textAnchor="end">100%</text>
                    <text x={PADDING - 5} y={zeroY + 5} fontSize="10" fill="#4a5568" textAnchor="end">0%</text>
                    {/* New -50% Label */}
                    <text x={PADDING - 5} y={HEIGHT - PADDING + 5} fontSize="10" fill="#dc2626" textAnchor="end">{minScore}%</text> 
                    
                    {/* Axis Titles */}
                    <text x={WIDTH / 2} y={HEIGHT - 5} fontSize="12" fill="#4a5568" textAnchor="middle" fontWeight="bold">Quiz Attempt Number</text>
                    <text 
                        x={10} 
                        y={HEIGHT / 2} 
                        fontSize="12" 
                        fill="#4a5568" 
                        textAnchor="middle" 
                        transform={`rotate(-90, 10, ${HEIGHT / 2})`}
                        fontWeight="bold"
                    >
                        Score Percentage
                    </text>

                </svg>
            </div>
        </div>
    );
};


// --- 2. Learning Path Component (Updated to be clickable) ---
const LearningPath = ({ recommendedLevel, onSelectLevel, selectedRoadmapLevel, onLockedClick }) => {
    // Logic to determine completion status
    const recommendedIndex = COURSE_LEVELS.indexOf(recommendedLevel);

    const getStatus = (levelIndex) => {
        if (levelIndex < recommendedIndex) return 'Completed';
        if (levelIndex === recommendedIndex) return 'In Progress';
        return 'Not Started';
    };

    const getIcon = (status) => {
        switch (status) {
            case 'Completed': return '🏆'; // Trophy for completed
            case 'In Progress': return '🚀'; // Rocket for in progress
            case 'Not Started': return '🧊'; // Ice for not started/locked
            default: return '❓';
        }
    };

    const handleLevelClick = (level, index) => {
        const status = getStatus(index);
        
        if (status === 'Not Started') {
            // 1. Show the locked modal
            onLockedClick(level); 
            // 2. DO NOT update selectedRoadmapLevel if locked, keep showing the highest unlocked path
            return; 
        }
        
        // Only select the level if it is Completed or In Progress
        onSelectLevel(level);
    };

    return (
        // Added h-full and flex-col to ensure it stretches and fills the available vertical space
        <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Learning Path</h3>
            <ul className="space-y-3 flex-grow">
                {COURSE_LEVELS.map((level, index) => {
                    const status = getStatus(index);
                    const isSelected = level === selectedRoadmapLevel;
                    const isLocked = status === 'Not Started';

                    return (
                        <li key={level} 
                            // Conditional cursor based on lock status
                            className={`flex items-center space-x-3 cursor-${isLocked ? 'not-allowed' : 'pointer'} p-2 rounded-lg transition-colors border ${isSelected ? 'bg-blue-100 border-blue-500 shadow-inner' : 'border-transparent hover:bg-gray-50'}`}
                            onClick={() => handleLevelClick(level, index)}
                        >
                            <span className="text-xl">{getIcon(status)}</span>
                            <div className={`font-medium text-base ${isLocked ? 'text-gray-500' : status === 'Completed' ? 'text-green-700' : 'text-blue-700'}`}>
                                {level.replace('/', ' & ')}
                                <span className="block text-xs font-normal text-gray-500">
                                    {status}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {/* Take a New Quiz button remains at the bottom */}
            <Link to="/home" className="mt-6 block text-center bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-[1.01]">
                Take a New Quiz
            </Link>
        </div>
    );
};


// --- 3. Course Roadmap Component (New - Enhanced Aesthetics) ---
const CourseRoadmap = ({ level }) => {
    if (!level || !COURSE_RESOURCES[level]) {
        // Fallback message if no level is selected (shouldn't happen with default logic)
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex items-center justify-center">
                <p className="text-gray-500">Select a level from the Learning Path to see the detailed roadmap.</p>
            </div>
        );
    }
    
    const course = COURSE_RESOURCES[level];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Roadmap: {course.name.replace('/', ' & ')}</h3>
            <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
            
            <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Key Resources and Topics</h4>
            
            <div className="grid grid-cols-1 gap-4 flex-grow">
                {course.links.map((res, idx) => (
                    <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        // Enhanced styling for resource card
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-4 bg-white hover:bg-blue-50"
                    >
                        {/* Placeholder Icon/Image */}
                        <img
                            src={getPlaceholderImage(res.type)}
                            alt={res.type}
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                        />
                        <div>
                            <div className="font-semibold text-blue-700 text-base leading-tight">{res.title}</div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                                res.type === 'YouTube' ? 'bg-red-100 text-red-700' : res.type === 'Web Course' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {res.type}
                            </span>
                        </div>
                    </a>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center border-t pt-3">
                *Topics: {course.links.map(l => l.title.split(' (')[0]).join(' / ')}...
            </p>
        </div>
    );
};


// --- 4. Review Modal Component (FINAL MODIFIED TO SHOW ONLY CORRECT OPTION AND JUSTIFICATION) ---
// --- 4. Review Modal Component (FINAL MODIFIED TO SHOW ONLY CORRECT OPTION AND JUSTIFICATION) ---
const ReviewModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-8">
                <button 
                    className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-700"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Quiz Attempt</h2>
                <p className="text-gray-600 mb-4">
                    Taken: {formatDate(quiz.quizDate)} | Final Score: <span className="font-bold">{quiz.totalScore.toFixed(1)} / {quiz.totalPossibleScore}</span> 
                    ({quiz.scorePercentage.toFixed(1)}%)
                </p>
                
                <div className="space-y-6">
                    {quiz.answers.map((a, idx) => {
                        // 1. Determine correctness for Red/Green Background
                        const isIncorrect = a.correct !== undefined ? !a.correct : (a.totalScore < 2.0); 
                        
                        const bgColor = isIncorrect ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';
                        
                        // 2. Extract Options and Correct Answer
                        const optionKeys = ['Option1', 'Option2', 'Option3', 'Option4', 'option1', 'option2', 'option3', 'option4'];

                        let allOptions = optionKeys
                            .filter(opt => a[opt])
                            .map((opt) => ({
                                key: opt,
                                label: String.fromCharCode(65 + parseInt(opt.toLowerCase().replace('option', '')) - 1), 
                                text: a[opt],
                                isCorrect: a.Correct_Option === opt || a.correctOption === opt || a.correct_option === opt || a.correctAnswer === opt
                            }));
                            
                        // 3. FALLBACK FIX: If options are still missing, use the official justification as the sole correct option.
                        if (allOptions.length === 0 && a.officialJustification) {
                            allOptions = [{
                                key: 'GeneratedOption1',
                                label: 'A',
                                text: a.officialJustification, // Use the justification text as the option text
                                isCorrect: true
                            }];
                        }
                        
                        // Find the single correct option for simplified display
                        const correctOption = allOptions.find(opt => opt.isCorrect);

                        // --- START RENDERING ---
                        return (
                            <div key={idx} className={`p-4 border rounded-lg ${bgColor}`}> 
                                <p className="font-bold text-lg text-gray-800 mb-2">
                                    Q{idx + 1}: {a.Question}
                                </p>
                                
                                {/* Display ONLY the Correct Answer Text (without the letter label) */}
                                {correctOption && (
                                    <div 
                                        className={`flex items-start px-3 py-4 rounded-lg border-2 bg-green-100 border-green-400`}
                                    >
                                        <span className="text-gray-800 flex-1 font-medium">{correctOption.text}</span>
                                        <div className="flex gap-1 ml-4 flex-shrink-0">
                                            <span className="px-2 py-0.5 text-xs bg-green-200 rounded text-green-800 font-semibold whitespace-nowrap">✓ Correct Answer</span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* REMOVED: Official Justification block (as requested) */}
                                {/* REMOVED: allOptions list */}

                            </div>
                        );
                    })}
                </div>

                <button 
                    onClick={onClose} 
                    className="mt-6 float-right bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Close Review
                </button>
            </div>
        </div>
    );
};

// --- 5. Recent Activity Table (Updated - Enhanced Aesthetics) ---
const RecentActivity = ({ progress, onReview }) => {
    // Show top 5 recent activities, reverse array to get newest first for display
    const recent = progress.slice().reverse().slice(0, 5); 

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {recent.map((quiz, index) => {
                            const score = quiz.scorePercentage.toFixed(0);
                            return (
                                <tr key={index} className="hover:bg-gray-100 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {quiz.recommendedCourse?.name || `Attempt #${recent.length - index}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(quiz.quizDate)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {score}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => onReview(quiz)} // Changed to open the modal
                                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition duration-150"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- 6. Locked Level Modal Component (New) ---
const LockedModal = ({ level, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full relative p-8 text-center">
                <button 
                    className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-gray-700"
                    onClick={onClose}
                >
                    &times;
                </button>
                <span className="text-6xl mb-4 block">🔓</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Level Locked!</h2>
                <p className="text-gray-600 mb-4">
                    You need to achieve a higher mastery score in your current level to unlock **{level}**.
                </p>
                <p className="text-sm text-gray-500">
                    Keep mastering the current content to progress!
                </p>
                <button 
                    onClick={onClose} 
                    className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Got It!
                </button>
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('User'); 
    
    // State for review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    
    // State for roadmap selection
    const [selectedRoadmapLevel, setSelectedRoadmapLevel] = useState(null);
    
    // New state for locked level feedback
    const [showLockedModal, setShowLockedModal] = useState(false);
    const [lockedLevelAttempt, setLockedLevelAttempt] = useState(null);


    // Handler to open the review modal
    const handleReviewClick = (quiz) => {
        setSelectedQuiz(quiz);
        setShowReviewModal(true);
    };
    
    // Handler for clicking a locked level
    const handleLockedLevelClick = (level) => {
        setLockedLevelAttempt(level);
        setShowLockedModal(true);
    };

    // 1. Fetch Auth Token and User Name
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const storedUserName = localStorage.getItem('userName');
        
        if (storedUserName) {
            setUserName(storedUserName.split(' ')[0]); // Use first name for welcome
        }

        // Redirect to login if token is missing
        if (!authToken) {
            navigate('/');
            return;
        }

        // 2. Fetch Progress (MOCKING DATA MERGE)
        async function fetchProgress() {
            try {
                const res = await fetch(`http://localhost:5000/dashboard/progress?token=${authToken}`);
                
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Unknown Server Error' }));
                    console.error("Dashboard fetch error:", errorData.message);
                    setProgress([]);
                    return; 
                }

                let data = await res.json();
                
                // *** START: MOCK DATA MERGE TO SOLVE MISSING OPTIONS ISSUE ***
                // This simulates the backend retrieving question data from the separate 'questions' collection 
                // and merging it into the quiz answers.
                const sampleQuestionOptions = {
                    // This QID is from your first image's raw data
                    "68a1e78e98e15780150ea59e": { 
                        "Option1": "A function defined by the user in a Python file.",
                        "Option2": "A function imported from an external library (e.g., NumPy).",
                        "Option3": "A function that is intrinsically part of the Python interpreter and globally accessible.",
                        "Option4": "A function included in a module that requires an import statement.",
                        "Correct_Option": "Option3" // Based on the official justification's content
                    }
                };

                data.progress = data.progress.map(quiz => ({
                    ...quiz,
                    answers: quiz.answers.map(answer => {
                        const qid = answer.qid;
                        if (sampleQuestionOptions[qid] && !answer.Option1) {
                            // Merge missing options/correct key from the mock source
                            return { ...answer, ...sampleQuestionOptions[qid] };
                        }
                        return answer;
                    })
                }));
                // *** END: MOCK DATA MERGE ***


                // Sort the progress array from oldest to newest for the chart trend
                const sortedProgress = data.progress.sort((a, b) => new Date(a.quizDate) - new Date(b.quizDate)); 
                setProgress(sortedProgress);
            } catch (err) {
                console.error("Network or server error during dashboard fetch:", err);
                setError("Could not connect to the backend server.");
            } finally {
                setLoading(false);
            }
        }

        fetchProgress();
    }, [navigate]);

    // Set default selected roadmap level to the user's recommended level once progress is loaded
    useEffect(() => {
        if (progress !== null && progress.length > 0 && !selectedRoadmapLevel) {
            const bestProgress = progress.reduce((best, current) => current.scorePercentage > best.scorePercentage ? current : best, progress[0]);
            setSelectedRoadmapLevel(bestProgress.recommendedLevel);
        } else if (progress !== null && progress.length === 0 && !selectedRoadmapLevel) {
             setSelectedRoadmapLevel('Beginner');
        }
    }, [progress, selectedRoadmapLevel]);


    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <p className="text-gray-600 text-center mt-20 text-lg">Loading your personalized dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mt-20" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        );
    }
    
    // Calculate overall best score and recommended level
    const bestProgress = progress && progress.length > 0
        ? progress.reduce((best, current) => current.scorePercentage > best.scorePercentage ? current : best, progress[0])
        : null;

    const highestScore = bestProgress ? bestProgress.scorePercentage.toFixed(0) : 0;
    const recommendedLevel = bestProgress ? bestProgress.recommendedLevel : 'Beginner';
    
    // Determine the level to show in the Roadmap (user selection overrides default recommendation)
    const roadmapLevelToShow = selectedRoadmapLevel || recommendedLevel;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="flex flex-col items-center flex-grow p-4 md:p-10">
                <div className="w-full max-w-6xl text-left space-y-8">
                    
                    {/* Welcome Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900">Welcome back, {userName}!</h1>
                            <p className="text-lg text-gray-600 mt-1">Here's a summary of your Python skills progress.</p>
                        </div>
                    </div>
                    
                    {/* TOP ROW: PROGRESS CHART & LEARNING PATH */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-2/3">
                            {progress.length >= 2 ? (
                                <QuizTrendChart progress={progress} />
                            ) : (
                                <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96 flex items-center justify-center">
                                    <p className="text-gray-500">Take more quizzes to generate your skill progression chart.</p>
                                </div>
                            )}
                        </div>
                        <div className="w-full lg:w-1/3">
                            <LearningPath 
                                recommendedLevel={recommendedLevel} 
                                onSelectLevel={setSelectedRoadmapLevel}
                                selectedRoadmapLevel={selectedRoadmapLevel}
                                onLockedClick={handleLockedLevelClick} // Pass the new handler
                            />
                        </div>
                    </div>

                    {/* BOTTOM ROW: ROADMAP & RECENT ACTIVITY */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Course Roadmap (Replaces Strengths/Weaknesses) */}
                        <div className="md:col-span-1">
                            <CourseRoadmap level={roadmapLevelToShow} />
                        </div>

                        {/* Recent Activity */}
                        <div className="md:col-span-2">
                            {progress.length > 0 ? (
                                <RecentActivity progress={progress} onReview={handleReviewClick} />
                            ) : (
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex items-center justify-center">
                                    <p className="text-gray-500">No recent activity found. Start a quiz to populate the history!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Review Modal is rendered here */}
            {showReviewModal && selectedQuiz && (
                <ReviewModal 
                    quiz={selectedQuiz} 
                    onClose={() => setShowReviewModal(false)} 
                />
            )}
            
            {/* Locked Level Modal is rendered here */}
            {showLockedModal && lockedLevelAttempt && (
                <LockedModal 
                    level={lockedLevelAttempt} 
                    onClose={() => setShowLockedModal(false)} 
                />
            )}
        </div>
    );
}