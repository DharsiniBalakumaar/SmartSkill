import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './TutorChatBot.css';

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

    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
        if (location.pathname === '/home') {
             setIsOpen(false);
        }
    }, [location.pathname]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuery = input.trim();
        const userMessage = { sender: 'user', text: userQuery };

        // Filter out initial welcome, map others to OpenRouter format
        const historyPayload = messages
            .filter(msg => msg.level !== 'Welcome')
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

        // Add current user query to history
        historyPayload.push({ role: 'user', content: userQuery });

        // UI update
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const thinkingMessage = { sender: 'tutor', text: 'Tutor is typing...' };
        setMessages(prev => [...prev, thinkingMessage]);

        try {
            const response = await fetch('http://localhost:5000/chat/tutor', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery, history: historyPayload }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessages(prev => prev.slice(0, -1)); 
                const errorMessage = { 
                    sender: 'tutor', 
                    text: `API Error: ${response.status} - ${errorData.message || 'Server failed to respond.'}` 
                };
                setMessages(prev => [...prev, errorMessage]);
                return;
            }

            const data = await response.json();
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
            setMessages(prev => prev.slice(0, -1));
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

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([initialWelcomeMessage]);
        }
    }, [isOpen]);

    const isHidden = !isLoggedIn || location.pathname === '/home';

    if (isHidden) {
        return null;
    }

    return (
        <>
            <button 
                className={`floating-chat-button ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close Chat" : "Open Chat"}
            >
                <ChatIcon />
            </button>

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
