// File: smartskillFront/src/components/Header.jsx

import React from "react";
import { Link } from "react-router-dom";
// Note: We use Tailwind classes internally, so external CSS imports are often unnecessary
// import '../index.css'; 
// import "tailwindcss/tailwind.css"; 
// import "./Header.css"; 

export default function Header() {
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
          <Link className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors" to="/">Home</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors" to="/about">About</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors" to="/courses">Courses</Link>
          <Link className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors" to="/contact">Contact</Link>
        </nav>

        {/* Refactored Button using Tailwind for clean integration */}
      <Link 
            to="/register" 
            className="group relative inline-flex items-center justify-start overflow-hidden rounded-lg bg-white p-0.5 font-semibold transition-all duration-300 hover:bg-blue-600 shadow-md"
        >
            <span className="absolute inset-0 rounded-md transition-all duration-300 ease-out bg-blue-500 opacity-0 group-hover:opacity-100"></span>
            
            {/* Text Content */}
            <span className="relative flex items-center text-sm px-4 py-2 transition-all duration-300 ease-out text-gray-800 group-hover:text-white">
                Get started
            </span>

            {/* Icon Container */}
            <span className="relative flex h-full w-10 items-center justify-center rounded-r-lg bg-blue-600 transition-all duration-300 ease-out group-hover:bg-blue-700">
                <svg
                    height="24"
                    width="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                        fill="#FFFFFF" // White fill for the arrow
                    />
                </svg>
            </span>
        </Link>

      </div>
    </header>
  );
}
