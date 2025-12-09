import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScottBot } from './ScottBot';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock Logger
jest.mock('../../services/Logger', () => ({
    ChatLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn()
    }
}));

// Mock AWS Amplify Data Client
// Mock AWS Amplify Data Client
jest.mock('aws-amplify/data', () => {
    const mockAsk = jest.fn();
    return {
        generateClient: () => ({
            queries: {
                askBedrockAgent: mockAsk
            }
        })
    };
});

import { generateClient } from 'aws-amplify/data';
const client = generateClient() as any;
const mockAskAgent = client.queries.askBedrockAgent as jest.Mock;

describe('ScottBot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Embedded Mode Tests ---
    test('renders embedded mode (always open)', () => {
        render(<ScottBot mode="embedded" />);
        // Should show title immediately
        expect(screen.getByText('Scott-bot 🤖')).toBeInTheDocument();
        // Should NOT show FAB
        expect(screen.queryByText(/Chat with Scott-bot/)).not.toBeInTheDocument();
    });

    test('embedded mode sends message to agent', async () => {
        mockAskAgent.mockResolvedValue({ data: 'I am the Agent.' });
        render(<ScottBot mode="embedded" />);

        const input = screen.getByPlaceholderText('Ask about projects...');
        const button = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'Hello Agent' } });
        fireEvent.click(button);

        expect(screen.getByText('Hello Agent')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockAskAgent).toHaveBeenCalledWith({ message: 'Hello Agent' });
            expect(screen.getByText('I am the Agent.')).toBeInTheDocument();
        });
    });

    // --- Widget Mode Tests ---
    test('renders widget mode (FAB first)', () => {
        render(<ScottBot mode="widget" />);
        // Should show FAB
        expect(screen.getByText('💬 Chat with Scott-bot')).toBeInTheDocument();
        // Should NOT show chat window yet
        expect(screen.queryByText('Scott-bot 🤖')).not.toBeInTheDocument();
    });

    test('opens and closes widget', () => {
        render(<ScottBot mode="widget" />);

        // Open
        fireEvent.click(screen.getByText('💬 Chat with Scott-bot'));
        expect(screen.getByText('Scott-bot 🤖')).toBeInTheDocument();

        // Close
        fireEvent.click(screen.getByText('×'));
        expect(screen.getByText('💬 Chat with Scott-bot')).toBeInTheDocument();
        expect(screen.queryByText('Scott-bot 🤖')).not.toBeInTheDocument();
    });
});
