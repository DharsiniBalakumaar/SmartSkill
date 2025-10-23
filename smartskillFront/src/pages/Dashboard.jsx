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

// Utility function for consistent styling
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

    const scores = progress.map(p => p.scorePercentage);
    
    // Y-Axis Configuration (adjusted for potential negative scores)
    const maxScore = 100; 
    // Setting minScore to -50% to accommodate the -0.5 points penalty (which is -25% of the total max score)
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


// --- 2. Learning Path Component ---
const LearningPath = ({ recommendedLevel }) => {
    // Logic to determine completion status
    const recommendedIndex = COURSE_LEVELS.indexOf(recommendedLevel);

    const getStatus = (levelIndex) => {
        if (levelIndex < recommendedIndex) return 'Completed';
        if (levelIndex === recommendedIndex) return 'In Progress';
        return 'Not Started';
    };

    const getIcon = (status) => {
        switch (status) {
            case 'Completed': return '✅';
            case 'In Progress': return '➡️';
            case 'Not Started': return '🔒';
            default: return '❓';
        }
    };

    return (
        // Added h-full and flex-col to ensure it stretches and fills the available vertical space
        <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Learning Path</h3>
            <ul className="space-y-4 flex-grow">
                {COURSE_LEVELS.map((level, index) => {
                    const status = getStatus(index);
                    return (
                        <li key={level} className="flex items-center space-x-3">
                            <span className="text-xl">{getIcon(status)}</span>
                            <div className={`font-medium ${status === 'Completed' ? 'text-green-700' : status === 'In Progress' ? 'text-blue-700' : 'text-gray-500'}`}>
                                {level.replace('/', ' & ')}
                                <span className="block text-sm font-normal text-gray-500">
                                    {status}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {/* Take a New Quiz button remains at the bottom */}
            <Link to="/home" className="mt-6 block text-center bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                Take a New Quiz
            </Link>
        </div>
    );
};


// --- 3. Placeholder for Strengths/Weaknesses ---
const StrengthsWeaknesses = ({ bestScore }) => {
    // Added h-full to ensure it fills the vertical space of the grid cell
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Strengths & Weaknesses</h3>
            <div className="text-center py-4">
                <p className="text-4xl font-extrabold text-blue-600 mb-2">
                    {bestScore}%
                </p>
                <p className="text-gray-500">
                    Highest Score Achieved
                </p>
                <p className="text-sm text-gray-600 mt-3">
                    Detailed domain analysis requires more data points. Keep quizzing!
                </p>
            </div>
        </div>
    );
};


// --- 4. Review Modal Component ---
const ReviewModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Quiz Attempt</h2>
                <p className="text-gray-600 mb-4">
                    Taken: {formatDate(quiz.quizDate)} | Final Score: <span className="font-bold">{quiz.totalScore.toFixed(1)} / {quiz.totalPossibleScore}</span> 
                    ({quiz.scorePercentage.toFixed(1)}%)
                </p>
                
                <div className="space-y-6">
                    {quiz.answers.map((a, idx) => {
                        const isCorrect = a.correct;
                        const isJustificationRelevant = a.isJustificationRelevant;
                        const totalScore = a.totalScore;

                        // Calculate styling based on overall performance on the question
                        const headerColor = totalScore === 2.0 ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
                        const scoreColor = totalScore > 0 ? 'text-green-700' : 'text-red-700';

                        return (
                            <div key={idx} className={`p-4 border rounded-lg ${headerColor}`}>
                                <p className="font-bold text-lg text-gray-800 mb-2">
                                    Q{idx + 1}: {a.Question}
                                    <span className={`ml-3 px-3 py-1 text-xs rounded-full font-bold ${scoreColor}`}>
                                        {totalScore.toFixed(1)} Pts
                                    </span>
                                </p>

                                {/* User's Selection and Correct Answer */}
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm">
                                        Your Choice: <span className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                                            {a.selected} - {a[a.selected]}
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        Correct Answer: <span className="text-green-700 font-semibold">
                                            {a.Correct_Option} - {a[a.Correct_Option]}
                                        </span>
                                    </p>
                                </div>

                                {/* Justification and Feedback */}
                                <div className="mt-4 border-t pt-4">
                                    <p className="font-medium text-gray-700">Your Justification:</p>
                                    <p className="italic text-gray-800 p-2 bg-white rounded-md border text-sm">
                                        {a.selectedJustification}
                                    </p>
                                    <div className={`mt-2 p-3 rounded-lg ${isJustificationRelevant ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-300'}`}>
                                        <p className="font-semibold text-gray-800 mb-1">Official Feedback:</p>
                                        <p className="text-gray-700 text-sm italic">{a.officialJustification || 'No official explanation provided.'}</p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Keywords Required: {a.officialKeywords && a.officialKeywords.length > 0 ? a.officialKeywords.join(', ') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
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


// --- 5. Recent Activity Table (Updated) ---
const RecentActivity = ({ progress, onReview }) => {
    // Show top 5 recent activities, reverse array to get newest first for display
    const recent = progress.slice().reverse().slice(0, 5); 

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
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
                            <tr key={index} className="hover:bg-gray-50 transition duration-150">
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
                                        className="text-blue-600 hover:text-blue-900 font-semibold text-xs"
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
    );
};


// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('User'); 
    
    // New state for modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);


    // Handler to open the modal
    const handleReviewClick = (quiz) => {
        setSelectedQuiz(quiz);
        setShowReviewModal(true);
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

        // 2. Fetch Progress
        async function fetchProgress() {
            try {
                const res = await fetch(`http://localhost:5000/dashboard/progress?token=${authToken}`);
                
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Unknown Server Error' }));
                    // Log error but set progress to empty array for rendering
                    console.error("Dashboard fetch error:", errorData.message);
                    setProgress([]);
                    return; 
                }

                const data = await res.json();
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
                            <LearningPath recommendedLevel={recommendedLevel} />
                        </div>
                    </div>

                    {/* BOTTOM ROW: STRENGTHS & RECENT ACTIVITY (Added items-stretch) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Strengths & Weaknesses (Placeholder for Donut Chart) */}
                        <div className="md:col-span-1">
                            <StrengthsWeaknesses bestScore={highestScore} />
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
        </div>
    );
}
