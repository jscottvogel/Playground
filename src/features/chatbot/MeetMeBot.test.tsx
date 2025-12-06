import { render, screen, fireEvent, act } from '@testing-library/react';
import { MeetMeBot } from './MeetMeBot';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('MeetMeBot', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders initial greeting', () => {
        render(<MeetMeBot />);
        expect(screen.getByText(/Hi there/)).toBeInTheDocument();
    });

    test('responds to user input', () => {
        render(<MeetMeBot />);
        const input = screen.getByPlaceholderText('Type a message...');
        const button = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.click(button);

        expect(screen.getByText('Hello')).toBeInTheDocument(); // User message

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.getByText(/Ready to explore/)).toBeInTheDocument(); // Bot response
    });
});
