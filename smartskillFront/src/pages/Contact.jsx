// File: smartskillFront/src/pages/Contact.jsx

import React from 'react';

export default function Contact() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-md text-gray-600 mb-6">
          Have questions or feedback? Reach out to our support team!
        </p>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-700">Email: support@smartskill.com</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-700">Phone: 9976691515</p>
          </div>
        </div>
      </div>
    </div>
  );
}
