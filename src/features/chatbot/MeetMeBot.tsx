import { useState, useRef, useEffect } from 'react';
import './MeetMeBot.css';
import { ChatLogger } from '../../services/Logger';

/**
 * MeetMeBot Component
 * 
 * An interactive chatbot that allows users (Guests, Auth Users, Admins) to ask questions 
 * about the portfolio owner.
 * 
 * Features:
 * - Persistent chat history during the session
 * - Auto-scrolling to new messages
 * - Context-aware greeting (uses guest email if provided)
 * - Basic keyword matching for responses
 */

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export function MeetMeBot({ guestEmail }: { guestEmail?: string }) {
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: `Hi there! I'm the digital assistant for J. Scott Vogel.${guestEmail ? ` I see you're visiting as ${guestEmail}.` : ''} Ask me anything about his projects or experience!`
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Ref for auto-scrolling the chat window
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    /**
     * Handles user message submission.
     */
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        ChatLogger.info(`User sent message: ${userText}`);

        setTimeout(() => {
            const responseText = getBotResponse(userText);
            const botMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
            ChatLogger.info('Bot responded');
        }, 1000);
    };

    /**
     * Simple keyword-based response logic.
     * In a real app, this would call an AI backend or more complex NLP service.
     */
    const getBotResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('project') || lowerInput.includes('work')) {
            return "Scott has worked on a variety of projects involving React, AWS, and AI integration. You can see the full detailed list in the Project Gallery!";
        }
        if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('reach')) {
            return "You can reach Scott at j.scott.vogel@gmail.com.";
        }
        if (lowerInput.includes('skill') || lowerInput.includes('tech')) {
            return "He is proficient in TypeScript, React, Node.js, Python, and cloud architecture on AWS.";
        }
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            return "Hello! How can I help you today?";
        }

        return "That's a great question! I'm still learning about Scott's specific details on that topic, but feel free to browse the gallery for more info.";
    };

    return (
        <div className="card bot-container">
            <div className="bot-header">
                <h3 className="bot-title">MeetMe Chatbot 🤖</h3>
            </div>

            <div className="bot-messages">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`bot-message-bubble ${msg.sender === 'user' ? 'bot-msg-user' : 'bot-msg-bot'}`}
                    >
                        {msg.text}
                    </div>
                ))}
                {isTyping && <div className="bot-message-bubble bot-msg-bot">Typing...</div>}
                <div ref={messagesEndRef} />
            </div>

            <form className="bot-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="bot-input"
                    placeholder="Ask about projects..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
        </div>
    );
}
