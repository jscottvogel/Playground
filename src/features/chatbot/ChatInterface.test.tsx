import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';

// Mock ScottBot
jest.mock('./ScottBot', () => ({
    ScottBot: ({ mode }: { mode: string }) => <div data-testid="scott-bot">ScottBot ({mode})</div>
}));

describe('ChatInterface', () => {
    test('renders split screen with instructions and bot', () => {
        render(<ChatInterface userEmail="test@user.com" />);

        expect(screen.getByRole('heading', { level: 2, name: 'Chat with Scott' })).toBeInTheDocument();
        expect(screen.getByText(/I'm an AI assistant/)).toBeInTheDocument();
        expect(screen.getByTestId('scott-bot')).toBeInTheDocument();
    });

    test('renders suggestions', () => {
        render(<ChatInterface />);

        expect(screen.getByText(/"What technologies did you use for the Portfolio project\?"/)).toBeInTheDocument();
    });

    test('displays user email or Guest', () => {
        const { rerender } = render(<ChatInterface userEmail="guest@example.com" />);
        expect(screen.getByText(/Viewing as/)).toHaveTextContent('guest@example.com');

        rerender(<ChatInterface />);
        expect(screen.getByText(/Viewing as/)).toHaveTextContent('Guest');
    });
});
