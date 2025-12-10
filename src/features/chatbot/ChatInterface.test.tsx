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

    test('shows sign in link only when onSignInRequest is provided', async () => {
        const onSignIn = jest.fn();
        const user = userEvent.setup();

        // Guest Mode
        const { rerender } = render(<ChatInterface userEmail="guest@example.com" onSignInRequest={onSignIn} />);
        const signInLink = screen.getByText('Sign In or Sign Up');
        expect(signInLink).toBeInTheDocument();
        expect(screen.getByText(/Viewing as/)).toHaveTextContent('guest@example.com');

        await user.click(signInLink);
        expect(onSignIn).toHaveBeenCalled();

        // Auth Mode
        rerender(<ChatInterface userEmail="auth@example.com" />);
        expect(screen.queryByText('Sign In or Sign Up')).not.toBeInTheDocument();
        expect(screen.getByText(/Viewing as/)).toHaveTextContent('auth@example.com');
    });
});
