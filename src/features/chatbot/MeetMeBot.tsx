import { useState, useRef, useEffect } from 'react';

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
        <div className="card animate-fade-in" style={{ height: '600px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: 0 }}>Meet Me Chatbot 🤖</h3>
            </div>

            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                        borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px'
                    }}>
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{ marginBottom: 0 }}
                />
                <button type="submit" className="btn btn-primary">Send</button>
            </form>
        </div>
    );
}
