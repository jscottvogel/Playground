import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ScottBot } from './ScottBot';

// Mock scrollIntoView and scrollTo
window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.scrollTo = jest.fn();

// Mock Logger
jest.mock('../../services/Logger', () => ({
    ChatLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn()
    }
}));

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

// Mock AWS Amplify Auth Client
jest.mock('aws-amplify/auth', () => ({
    getCurrentUser: jest.fn(() => Promise.reject(new Error('Not authenticated')))
}));

import { generateClient } from 'aws-amplify/data';
const client = generateClient() as any;
const mockAskAgent = client.queries.askBedrockAgent as jest.Mock;

describe('ScottBot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Embedded Mode Tests ---
    test('renders embedded mode (always open)', async () => {
        await act(async () => {
            render(<ScottBot mode="embedded" />);
        });
        // Should show title immediately
        expect(screen.getByText('LabAssistant 🧪')).toBeInTheDocument();
        // Should NOT show FAB
        expect(screen.queryByText('💬 Chat with LabAssistant')).not.toBeInTheDocument();
    });

    test('embedded mode sends message to agent', async () => {
        mockAskAgent.mockResolvedValue({ data: 'I am the Agent.' });
        await act(async () => {
            render(<ScottBot mode="embedded" />);
        });

        const input = screen.getByPlaceholderText('Ask about the Lab...');
        const button = screen.getByText('Send');

        await act(async () => {
            fireEvent.change(input, { target: { value: 'Hello Agent' } });
            fireEvent.click(button);
        });

        expect(screen.getByText('Hello Agent')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockAskAgent).toHaveBeenCalledWith({ message: 'Hello Agent' }, { authMode: 'apiKey' });
            expect(screen.getByText('I am the Agent.')).toBeInTheDocument();
        });
    });

    // --- Widget Mode Tests ---
    test('renders widget mode (FAB first)', async () => {
        await act(async () => {
            render(<ScottBot mode="widget" />);
        });
        // Should show FAB
        expect(screen.getByText('💬 Chat with LabAssistant')).toBeInTheDocument();
        // Should NOT show chat window yet
        expect(screen.queryByText('LabAssistant 🧪')).not.toBeInTheDocument();
    });

    test('opens and closes widget', async () => {
        await act(async () => {
            render(<ScottBot mode="widget" />);
        });

        // Open
        await act(async () => {
            fireEvent.click(screen.getByText('💬 Chat with LabAssistant'));
        });
        expect(screen.getByText('LabAssistant 🧪')).toBeInTheDocument();

        // Close
        await act(async () => {
            fireEvent.click(screen.getByText('×'));
        });
        expect(screen.getByText('💬 Chat with LabAssistant')).toBeInTheDocument();
        expect(screen.queryByText('LabAssistant 🧪')).not.toBeInTheDocument();
    });
});
