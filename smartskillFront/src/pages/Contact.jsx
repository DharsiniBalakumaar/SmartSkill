// File: smartskillFront/src/pages/Contact.jsx

import React from 'react';
import Header from "../components/Header"; 

export default function Contact() {
    const emailAddress = "support@smartskill.com";
    const phoneNumber = "9976691515";

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-xl text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
                    <p className="text-md text-gray-600 mb-6">
                        Have questions or feedback? Reach out to our support team!
                    </p>
                    <div className="space-y-4">
                        
                        {/* 📢 Email link using mailto: (Best standard practice) */}
                        <div className="p-3 bg-blue-50 rounded-lg group hover:bg-blue-100 transition duration-150">
                            <a 
                                href={`mailto:${emailAddress}`}
                                className="font-semibold text-blue-700 cursor-pointer group-hover:text-blue-900"
                            >
                                Email: {emailAddress}
                            </a>
                        </div>
                        
                        {/* Phone number for easy copying */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                            <input
                                id="phone-number"
                                type="text"
                                readOnly
                                value={`Phone: ${phoneNumber}`}
                                onClick={(e) => { 
                                    e.target.select(); 
                                    document.execCommand('copy'); 
                                    alert('Phone number copied to clipboard!'); 
                                }}
                                className="w-full text-center font-semibold text-blue-700 bg-transparent border-none cursor-copy focus:ring-0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}