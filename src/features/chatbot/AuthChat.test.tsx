import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthChat } from './AuthChat';

// Mock ScottBot since we are testing layout
jest.mock('./ScottBot', () => ({
    ScottBot: ({ mode }: { mode: string }) => <div data-testid="scott-bot">ScottBot ({mode})</div>
}));

describe('AuthChat', () => {
    test('renders split screen with instructions and bot', () => {
        render(<AuthChat userEmail="test_user" />);

        // Check Left Panel content
        expect(screen.getByText('Have Questions?')).toBeInTheDocument();
        expect(screen.getByText(/I'm here to help you navigate/)).toBeInTheDocument();
        expect(screen.getByText('Suggested Technical Topics:')).toBeInTheDocument();

        // Check Right Panel content (Bot)
        expect(screen.getByTestId('scott-bot')).toBeInTheDocument();
        expect(screen.getByText('ScottBot (embedded)')).toBeInTheDocument();
    });

    test('renders suggestions', () => {
        render(<AuthChat userEmail="test_user" />);

        expect(screen.getByText(/"How was the Project Gallery built\?"/)).toBeInTheDocument();
        expect(screen.getByText(/"Tell me about the admin dashboard features\."/)).toBeInTheDocument();
    });
});
