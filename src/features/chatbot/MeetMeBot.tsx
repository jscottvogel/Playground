import { useState, useRef, useEffect } from 'react';
import './MeetMeBot.css';
import { ChatLogger } from '../../services/Logger';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

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

export function MeetMeBot({ guestEmail, initialOpen = false }: { guestEmail?: string; initialOpen?: boolean }) {
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            text: `Hi there! I'm the digital assistant for Scott Vogel.${guestEmail ? ` I see you're visiting as ${guestEmail}.` : ''} Ask me anything about his projects or experience!`
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
    /**
     * Handles user message submission.
     */
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userText = inputValue;
        const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        ChatLogger.info(`User sent message: ${userText}`);

        try {
            // Call the Bedrock Agent
            // Using 'any' cast temporarily until schema is regenerated types
            const response = await (client.queries as any).askBedrockAgent({ message: userText });
            const responseText = response.data || "I couldn't get a response from the agent.";

            const botMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            ChatLogger.info('Bot responded');
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting to my brain right now.", sender: 'bot' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };



    const [isOpen, setIsOpen] = useState(initialOpen);

    // --- Interaction ---
    const toggleChat = () => setIsOpen(!isOpen);

    if (!isOpen) {
        return (
            <button className="bot-fab animate-bounce-in" onClick={toggleChat} aria-label="Open Chat">
                💬 Ask AI
            </button>
        );
    }

    return (
        <div className="card bot-container bot-widget animate-fade-in">
            <div className="bot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="bot-title">MeetMe Chatbot 🤖</h3>
                <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
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
