import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestChat } from './GuestChat';

// Mock ScottBot since we are testing layout, not bot logic here
jest.mock('../chatbot/ScottBot', () => ({
    ScottBot: ({ mode }: { mode: string }) => <div data-testid="scott-bot">ScottBot ({mode})</div>
}));

describe('GuestChat', () => {
    test('renders split screen with instructions and bot', () => {
        render(<GuestChat guestEmail="test@user.com" onSignInRequest={jest.fn()} />);

        // Check Left Panel content
        expect(screen.getByText('Chat with ScottBot')).toBeInTheDocument();
        expect(screen.getByText(/I'm an AI assistant/)).toBeInTheDocument();
        expect(screen.getByText(/Viewing as/)).toBeInTheDocument();
        expect(screen.getByText('test@user.com')).toBeInTheDocument();

        // Check Right Panel content (Bot)
        expect(screen.getByTestId('scott-bot')).toBeInTheDocument();
        expect(screen.getByText('ScottBot (embedded)')).toBeInTheDocument();
    });

    test('renders suggestions', () => {
        render(<GuestChat guestEmail="test@user.com" onSignInRequest={jest.fn()} />);

        expect(screen.getByText(/What technologies did you use/)).toBeInTheDocument();
        expect(screen.getByText(/experience with AWS/)).toBeInTheDocument();
    });

    test('sign in link calls handler', async () => {
        const onSignIn = jest.fn();
        const user = userEvent.setup();

        render(<GuestChat guestEmail="test@user.com" onSignInRequest={onSignIn} />);

        const signInLink = screen.getByText('Sign In or Sign Up');
        await user.click(signInLink);

        expect(onSignIn).toHaveBeenCalled();
    });
});
