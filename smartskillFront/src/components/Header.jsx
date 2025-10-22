import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState(null); 
    const [showDashboard, setShowDashboard] = useState(false);
    const [progressData, setProgressData] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(false);

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        setUserName(storedUserName ? storedUserName : null);
    }, [navigate]); 

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        setUserName(null); 
        navigate("/"); 
    };

    // Show dashboard when username is clicked
    const handleUsernameClick = async () => {
        setShowDashboard(true);
        setLoadingProgress(true);
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:5000/dashboard/progress?token=${token}`);
        const data = await res.json();
        setLoadingProgress(false);
        if(data.success && data.progress) {
            setProgressData(data.progress.reverse()); // Show most recent first
        } else {
            setProgressData([]);
        }
    };

    // Close the dashboard display
    const handleCloseDashboard = () => {
        setShowDashboard(false);
        setProgressData([]);
    };

    let navLinks = [
        { to: "/", label: "Landing" },
        { to: "/about", label: "About" },
        { to: "/courses", label: "Courses" },
        { to: "/contact", label: "Contact" },
    ];
    if (userName) {
        navLinks.splice(1, 0, { to: "/home", label: "Quiz" });
    }

    return (
        <header className="flex items-center justify-between border-b border-[#e7edf4] px-10 py-3 bg-white shadow-md sticky top-0 z-10">
            <div className="flex items-center gap-2 text-[#0d141c]">
                <div className="size-5 text-blue-600">
                    <svg viewBox="0 0 48 48" fill="currentColor">
                        <path d="M4 4H17.3V17.3H30.7V30.7H44V44H4V4Z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold">SmartSkill</h2>
            </div> 

            <div className="flex items-center gap-6">
                <nav className="hidden md:flex gap-8">
                    {navLinks.map((link, index) => {
                        const isCurrent = link.to === location.pathname || (link.to === '/' && location.pathname === '/');
                        return (
                        <Link 
                            key={index} 
                            className={`text-sm font-medium border-b-2 py-1 transition-colors 
                                ${isCurrent 
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-gray-300'
                                }`} 
                            to={link.to}
                        >
                            {link.label}
                        </Link>
                        );
                    })}
                </nav>

                {userName ? (
                    <div className="flex items-center gap-4">
                        {/* Username is clickable, shows dashboard */}
                        <span 
                            className="text-blue-600 font-semibold cursor-pointer underline" 
                            onClick={handleUsernameClick}
                            title="Show Dashboard"
                        >
                            {userName.split(' ')[0]}
                        </span>
                        <button 
                            onClick={handleLogout} 
                            className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/register" className="group relative inline-flex items-center justify-start overflow-hidden rounded-lg bg-white p-0.5 font-semibold transition-all duration-300 hover:bg-blue-600 shadow-md">
                        <span className="absolute inset-0 rounded-md transition-all duration-300 ease-out bg-blue-500 opacity-0 group-hover:opacity-100"></span>
                        <span className="relative flex items-center text-sm px-4 py-2 transition-all duration-300 ease-out text-gray-800 group-hover:text-white">
                            Get started
                        </span>
                        <span className="relative flex h-full w-10 items-center justify-center rounded-r-lg bg-blue-600 transition-all duration-300 ease-out group-hover:bg-blue-700">
                            <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path
                                    d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                    fill="#FFFFFF"
                                />
                            </svg>
                        </span>
                    </Link>
                )}
            </div>

            {/* Dashboard Modal */}
            {showDashboard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full relative">
                        <button 
                            className="absolute top-2 right-2 text-xl font-bold text-gray-700 hover:text-red-700"
                            onClick={handleCloseDashboard}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold text-blue-700 mb-4">Your Quiz Progress</h2>
                        {loadingProgress ? (
                            <div className="text-center text-gray-600 my-8">Loading dashboard...</div>
                        ) : (
                            <>
                            {(!progressData || progressData.length === 0) ? (
                                <div className="text-center text-red-600 my-6">No quiz history found yet.</div>
                            ) : (
                                <div className="max-h-[50vh] overflow-y-auto space-y-6">
                                    {progressData.map((prog, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 bg-gray-50 shadow">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-700 text-lg font-semibold">
                                                    {new Date(prog.quizDate).toLocaleString()}
                                                </span>
                                                <span className="font-semibold text-blue-600">{prog.recommendedLevel}</span>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-green-700 font-bold">{prog.totalScore} / {prog.totalPossibleScore}</span>
                                                <span className="text-gray-600 text-sm ml-2">({prog.scorePercentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="mb-2">
                                                <span className="block font-medium text-gray-700">{prog.recommendedCourse?.name}</span>
                                                <span className="block text-gray-600 text-xs mb-1">{prog.recommendedCourse?.description}</span>
                                                <div className="flex flex-wrap gap-3">
                                                    {prog.recommendedCourse?.links?.map((res, rIdx) => (
                                                        <a
                                                            key={rIdx}
                                                            href={res.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-300 rounded text-blue-700 font-medium border"
                                                        >
                                                            {res.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                            <details>
                                                <summary className="cursor-pointer text-sm text-gray-700 mt-2">View answers</summary>
                                                <div className="mt-2 space-y-2">
                                                    {prog.answers.map((ans, aIdx) => (
                                                        <div key={aIdx} className="border rounded p-2 bg-white">
                                                            <div className="text-gray-800 font-semibold">{ans.Question}</div>
                                                            <div className="text-gray-600 text-xs">
                                                                Answer: <span className="font-bold">{ans.selected}</span> &nbsp;
                                                                | Score: <span className={ans.totalScore > 0 ? "text-green-600" : "text-red-600"}>{ans.totalScore}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
