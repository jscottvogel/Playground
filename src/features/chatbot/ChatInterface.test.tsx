import { render, screen } from '@testing-library/react';
import { ChatInterface } from './ChatInterface';
import { MemoryRouter } from 'react-router-dom';

// Mock ScottBot
jest.mock('./ScottBot', () => ({
    ScottBot: ({ mode }: { mode: string }) => <div data-testid="scott-bot">ScottBot ({mode})</div>
}));

describe('ChatInterface', () => {
    test('renders split screen with instructions and bot', () => {
        render(
            <MemoryRouter>
                <ChatInterface userEmail="test@user.com" />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 2, name: 'Chat with LabAssistant 🧪' })).toBeInTheDocument();
        expect(screen.getByText(/I'm an AI assistant/)).toBeInTheDocument();
        expect(screen.getByTestId('scott-bot')).toBeInTheDocument();
    });

    test('renders suggestions', () => {
        render(
            <MemoryRouter>
                <ChatInterface />
            </MemoryRouter>
        );

        expect(screen.getByText(/"What services does Vogel Solutions Lab offer\?"/)).toBeInTheDocument();
    });

    test('displays user email or Guest', () => {
        const { rerender } = render(
            <MemoryRouter>
                <ChatInterface userEmail="guest@example.com" />
            </MemoryRouter>
        );
        expect(screen.getByText(/Viewing as/)).toHaveTextContent('guest@example.com');

        rerender(
            <MemoryRouter>
                <ChatInterface />
            </MemoryRouter>
        );
        expect(screen.getByText(/Viewing as/)).toHaveTextContent('Guest');
    });
});
