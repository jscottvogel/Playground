import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ScottBot.css';
import { ChatLogger } from '../../services/Logger';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Interface for controlling ScottBot externally.
 */
export interface ScottBotHandle {
    setInput: (text: string) => void;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

interface ScottBotProps {
    guestEmail?: string;
    mode?: 'widget' | 'embedded';
}

export const ScottBot = forwardRef<ScottBotHandle, ScottBotProps>(({ guestEmail, mode = 'widget' }, ref) => {
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
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        setInput: (text: string) => {
            setInputValue(text);
        }
    }));

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    };

    // Scroll whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

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

            if (response.errors && response.errors.length > 0) {
                console.error("Backend errors:", response.errors);
                throw new Error(response.errors[0].message);
            }

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

    const [isOpen, setIsOpen] = useState(mode === 'embedded');

    // --- Interaction ---
    const toggleChat = () => setIsOpen(!isOpen);

    if (!isOpen) {
        return (
            <button className="bot-fab animate-bounce-in" onClick={toggleChat} aria-label="Open Chat">
                💬 Chat with Scott-bot
            </button>
        );
    }

    return (
        <div className={`card bot-container ${mode === 'widget' ? 'bot-widget' : ''} animate-fade-in`}>
            <div className="bot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="bot-title">Scott-bot 🤖</h3>
                {mode === 'widget' && (
                    <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                )}
            </div>

            <div className="bot-messages" ref={messagesContainerRef}>
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`bot-message-bubble ${msg.sender === 'user' ? 'bot-msg-user' : 'bot-msg-bot'}`}
                    >
                        {msg.text}
                    </div>
                ))}
                {isTyping && <div className="bot-message-bubble bot-msg-bot">Typing...</div>}

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
});
