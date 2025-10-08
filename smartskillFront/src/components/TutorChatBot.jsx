// File: smartskillFront/src/components/TutorChatBot.jsx (FINAL, COMPLETE CODE with OpenRouter FIX)

import React, { useState, useRef, useEffect } from 'react';
import './TutorChatBot.css'; 

// 💬 Simple Chat Icon 
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const TutorChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Scroll to the bottom of the chat window on new message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuery = input.trim();
        const userMessage = { sender: 'user', text: userQuery };

        // 📢 UPDATED: Build the message history structure for the OpenRouter/OpenAI API
        const historyPayload = messages
            .filter(msg => msg.level !== 'Welcome') // Filter out the initial welcome message
            .map(msg => ({
                // ✅ FIX: Map 'tutor' sender to 'assistant' role for OpenAI/OpenRouter compatibility
                role: msg.sender === 'user' ? 'user' : 'assistant', 
                parts: [{ text: msg.text }]
            }));
        
        // Add the current user query to the history payload
        historyPayload.push({ role: 'user', parts: [{ text: userQuery }] });


        // Add user message to state and clear input (UI update)
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        // Add a temporary 'thinking' message
        const thinkingMessage = { sender: 'tutor', text: 'Tutor is typing...' };
        setMessages(prev => [...prev, thinkingMessage]);

        try {
            const response = await fetch('http://localhost:5000/chat/tutor', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send the full history
                body: JSON.stringify({ userQuery, history: historyPayload }), 
            });

            // IMPROVED: Handle non-200 responses specifically
            if (!response.ok) {
                const errorData = await response.json();
                // Remove the 'thinking' message
                setMessages(prev => prev.slice(0, -1)); 

                const errorMessage = { 
                    sender: 'tutor', 
                    text: `API Error: ${response.status} - ${errorData.message || 'Server failed to respond.'}` 
                };
                setMessages(prev => [...prev, errorMessage]);
                return; // Stop execution
            }

            const data = await response.json();
            
            // Remove the 'thinking' message before adding the real response
            setMessages(prev => prev.slice(0, -1)); 

            if (data.success) {
                const tutorMessage = { 
                    sender: 'tutor', 
                    text: data.tutorResponse,
                    level: data.predictedLevel 
                };
                setMessages(prev => [...prev, tutorMessage]);
            } else {
                const errorMessage = { sender: 'tutor', text: 'Error: Could not get a response from the tutor.' };
                setMessages(prev => [...prev, errorMessage]);
            }

        } catch (error) {
            console.error('Chatbot API error:', error);
            setMessages(prev => prev.slice(0, -1)); // Remove thinking message
            const errorMessage = { sender: 'tutor', text: 'Network Error: Cannot reach the server.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const initialWelcomeMessage = { 
        sender: 'tutor', 
        text: "👋 Hello! I'm your SmartSkill Tutor. Ask me any Python question and I'll give you a detailed answer and a difficulty assessment.",
        level: 'Welcome'
    };
    
    // Set initial message only once when opening
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([initialWelcomeMessage]);
        }
    }, [isOpen]);


    return (
        <>
            {/* The Floating Button */}
            <button 
                className={`floating-chat-button ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close Chat" : "Open Chat"}
            >
                <ChatIcon />
            </button>

            {/* The Chat Window */}
            {isOpen && (
                <div className="chat-window-container">
                    <div className="chat-header">
                        <span className="chat-title">SmartSkill Tutor</span>
                        <button className="close-button" onClick={() => setIsOpen(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="message-bubble">
                                    {msg.sender === 'tutor' && msg.level && msg.level !== 'Welcome' && msg.level !== 'Unknown' && (
                                        <div className="difficulty-tag">
                                            Difficulty: <strong>{msg.level}</strong>
                                        </div>
                                    )}
                                    {/* Using dangerouslySetInnerHTML for potential line breaks/markdown from Gemini */}
                                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-input-form" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? "Please wait..." : "Ask your Python question..."}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default TutorChatBot;
