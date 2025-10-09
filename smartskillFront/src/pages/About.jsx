// File: smartskillFront/src/pages/About.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Header"; // 📢 NEW: Import the central Header

// Placeholder icons using Tailwind-friendly SVG structure
const IconChecklist = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 14h.01" />
    </svg>
);

const IconBrain = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v14M9 19c0 1.105-1.79 2-4 2s-4-.895-4-2 1.79-2 4-2 4 .895 4 2zM21 17a2 2 0 002-2v-4a2 2 0 00-2-2h-3l-2.493 2.493c-1.39 1.39-3.666 1.39-5.056 0L8 9a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2h2m4-2a2 2 0 002 2h2a2 2 0 002-2" />
    </svg>
);

const IconMap = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="p-4 md:p-12 max-w-6xl mx-auto w-full"> {/* Center content and ensure spacing */}

            {/* --- 1. Hero Section --- */}
            <div className="text-center mb-16 bg-white p-10 rounded-xl shadow-lg border-t-4 border-blue-500 mt-6"> {/* Added mt-6 for initial spacing */}
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                    Unlock Your True Potential with <span className="text-blue-600">SmartSkill</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                    We go beyond simple correctness. SmartSkill is the adaptive learning platform that grades your **justification** to measure true comprehension.
                </p>
            </div>
            
            <hr className="mb-16 border-gray-300" />

            {/* --- 2. Value Proposition Grid --- */}
            <div className="grid md:grid-cols-3 gap-8">
                
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <IconChecklist />
                    <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Dual Grading System</h3>
                    <p className="text-gray-600">
                        Earn points for both the correct answer and a relevant, keyword-rich justification. We reward **deep understanding**, not just lucky guesses.
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500 hover:shadow-xl transition-shadow">
                    <IconBrain />
                    <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">AI-Powered Insights</h3>
                    <p className="text-gray-600">
                        Our platform uses Machine Learning to auto-classify questions and analyze your justifications in real-time, providing instant, personalized feedback.
                    </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <IconMap />
                    <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Personalized Learning</h3>
                    <p className="text-gray-600">
                        We map your score directly to our **Courses** page, recommending the exact resources (Beginner, Intermediate, Advanced) you need next.
                    </p>
                </div>
                
            </div>
            
            <hr className="my-16 border-gray-300" />
            
            {/* --- 3. Call to Action --- */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to test your knowledge?</h2>
                <Link 
                    to="/home" 
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                >
                    Start the Quiz Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
                <p className="text-sm text-gray-500 mt-4">Or, check out our recommended resources on the <Link to="/courses" className="text-blue-600 hover:underline">Courses</Link> page.</p>
            </div>

        </div>
    </div>
  );
}