// File: smartskillFront/src/pages/Courses.jsx

import React from 'react';
import Header from "../components/Header"; // 📢 NEW: Import the central Header

// NOTE: We hardcode the COURSE_RESOURCES here to make this component runnable,
// but in a real app, this data would come from the backend or a shared constants file.
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

const DIFFICULTY_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Expert/New Domain'];


export default function Courses() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full"> {/* ADDED max-w-7xl and mx-auto */}
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center mt-6">
                    Our Recommended Learning Paths
                </h1>
                <p className="text-center text-lg text-gray-600 max-w-4xl mx-auto mb-10">
                    Explore curated resources, tutorials, and courses based on your current proficiency level.
                </p>

                <div className="space-y-12">
                    {DIFFICULTY_ORDER.map(key => {
                        const course = COURSE_RESOURCES[key];
                        const levelColor = {
                            'Beginner': 'border-red-500 bg-red-50',
                            'Intermediate': 'border-blue-500 bg-blue-50',
                            'Advanced': 'border-yellow-500 bg-yellow-50',
                            'Expert/New Domain': 'border-purple-500 bg-purple-50',
                        }[key];

                        return (
                            <div key={key} className={`p-6 rounded-xl shadow-lg border-l-8 ${levelColor}`}>
                                <h2 className="text-3xl font-bold mb-3 text-gray-800">{key} Path: {course.name}</h2>
                                <p className="text-gray-600 mb-6">{course.description}</p>
                                
                                <h3 className="text-xl font-semibold mb-3 text-gray-700">Top Resources:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.links.map((link, index) => (
                                        <a 
                                            key={index} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition duration-150"
                                        >
                                            <img 
                                                src={getPlaceholderImage(link.type)}
                                                alt={link.type} 
                                                className="w-16 h-10 object-cover rounded-md mr-3 flex-shrink-0"
                                                onError={(e) => { e.target.onerror = null; e.target.src = getPlaceholderImage('Link'); }}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium text-sm text-gray-900 truncate">{link.title}</span>
                                                <span className="text-xs text-blue-600">{link.type} Link</span>
                                            </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}