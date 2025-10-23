import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState(null); 

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

    // FIX: Instead of opening a modal and fetching data in the Header, 
    // we navigate directly to the Dashboard route.
    const handleDashboardClick = () => {
        navigate('/dashboard');
    };

    let navLinks = [
        { to: "/", label: "Landing" },
        { to: "/about", label: "About" },
        { to: "/courses", label: "Courses" },
        { to: "/contact", label: "Contact" },
    ];
    if (userName) {
        // Add Quiz link right after Landing
        navLinks.splice(1, 0, { to: "/home", label: "Quiz" });
        // Add Dashboard link, which is now mandatory for navigation
        navLinks.splice(2, 0, { to: "/dashboard", label: "Dashboard" }); 
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
                        {/* Now use handleDashboardClick to navigate, and keep the user name clickable */}
                        <span 
                            className="text-blue-600 font-semibold cursor-pointer underline" 
                            onClick={handleDashboardClick}
                            title="Go to Dashboard"
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
        </header>
    );
}
