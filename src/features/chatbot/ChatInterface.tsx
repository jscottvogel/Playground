import { useRef } from 'react';
import { ScottBot, type ScottBotHandle } from './ScottBot';
import './ChatInterface.css';

interface ChatInterfaceProps {
    userEmail?: string;
    className?: string;
}

export function ChatInterface({ userEmail, className = '' }: ChatInterfaceProps) {
    const botRef = useRef<ScottBotHandle>(null);

    const handleSuggestionClick = (text: string) => {
        if (botRef.current) {
            botRef.current.setInput(text);
        }
    };

    const suggestions = [
        "What services does Vogel Solutions Lab offer?",
        "Tell me about the Wedding App launching by August 31st.",
        "What SaaS products are you incubating?",
        "How can I book a project consultation?"
    ];

    return (
        <section className={`chat-interface-wrapper ${className}`}>
            <h2 className="chat-main-title">Chat with LabAssistant 🧪</h2>

            <div className="chat-interface-layout animate-fade-in">
                {/* Left Panel: Instructions & Suggestions */}
                <div className="chat-instructions-panel">
                    <p className="instruction-lead">
                        I'm an AI assistant trained on Vogel Solutions Lab LLC.
                        I can answer questions about our SaaS incubator, custom development solutions, and active roadmap.
                    </p>

                    <div className="suggestions-list">
                        <h3>Try asking:</h3>
                        {suggestions.map((text, index) => (
                            <button
                                key={index}
                                className="suggestion-card"
                                onClick={() => handleSuggestionClick(text)}
                            >
                                "{text}"
                            </button>
                        ))}
                    </div>

                    <div className="footer-note">
                        <p>
                            Viewing as <strong>{userEmail || 'Guest'}</strong>
                        </p>
                    </div>
                </div>

                {/* Right Panel: The Bot */}
                <div className="chat-bot-panel">
                    <ScottBot
                        ref={botRef}
                        guestEmail={userEmail}
                        mode="embedded"
                    />
                </div>
            </div>
        </section>
    );

}
