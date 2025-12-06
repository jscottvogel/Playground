import { useState, useRef, useEffect } from 'react';
import './MeetMeBot.css';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
}

export function MeetMeBot({ guestEmail }: { guestEmail?: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: `Hi there! I'm the digital assistant for J. Scott Vogel.${guestEmail ? ` I see you're visiting as ${guestEmail}.` : ''} Ask me anything about his projects or experience!` }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simple bot logic
        setTimeout(() => {
            let responseText = "I'm still learning about that. Try asking about 'projects', 'skills', or 'contact'.";
            const lowerInput = userMsg.text.toLowerCase();

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                responseText = "Hello! Ready to explore?";
            } else if (lowerInput.includes('project')) {
                responseText = "You can view the full project portfolio by signing in! I can tell you about his work in React, AWS, and AI.";
            } else if (lowerInput.includes('skill') || lowerInput.includes('stack')) {
                responseText = "He is proficient in React, TypeScript, AWS Amplify, Node.js, and Python.";
            } else if (lowerInput.includes('contact')) {
                responseText = "You can reach out via LinkedIn or email.";
            } else if (lowerInput.includes('meet me')) {
                responseText = "That's me! I'm the Meet Me Chatbot.";
            }

            const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: responseText };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
    };

    return (
        <div className="card animate-fade-in bot-container">
            <div className="bot-header">
                <h3 className="bot-title">Meet Me Chatbot 🤖</h3>
            </div>

            <div className="bot-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`bot-message-bubble ${msg.sender === 'user' ? 'bot-msg-user' : 'bot-msg-bot'}`}>
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="bot-input-form">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="bot-input"
                />
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
        </div>
    );
}
