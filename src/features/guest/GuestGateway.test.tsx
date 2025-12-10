import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestGateway } from './GuestGateway';

// Mock Amplify Data client with singleton pattern
jest.mock('aws-amplify/data', () => {
    const mockCreate = jest.fn();
    const client = {
        models: {
            GuestVisit: {
                create: mockCreate
            }
        }
    };
    return {
        generateClient: () => client
    };
});

import { generateClient } from 'aws-amplify/data';
const client = generateClient() as any;
const mockCreate = client.models.GuestVisit.create as jest.Mock;

// Mock Logger to prevent console noise
jest.mock('../../services/Logger', () => ({
    GuestLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

describe('GuestGateway', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreate.mockResolvedValue({ errors: null }); // Default success
    });

    test('renders correctly', () => {
        render(<GuestGateway onAccessGranted={jest.fn()} onLoginRequest={jest.fn()} />);
        expect(screen.getByText('Welcome to Vogel Solutions')).toBeInTheDocument();
    });

    test.skip('shows error on invalid email', async () => {
        const user = userEvent.setup();
        render(<GuestGateway onAccessGranted={jest.fn()} onLoginRequest={jest.fn()} />);

        // Open Modal
        const openModalBtn = screen.getByText('Continue as Guest');
        await user.click(openModalBtn);

        // Wait for modal to appear
        const input = await screen.findByPlaceholderText('enter@email.com');
        const submitBtn = await screen.findByText('Start Chatting');

        await user.type(input, 'invalid-email');
        await user.click(submitBtn);

        // Use waitFor to ensure assertion runs after state updates
        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
        });
    });

    test('calls access granted and saves visit on valid email', async () => {
        const onAccessGranted = jest.fn();
        const user = userEvent.setup();

        render(<GuestGateway onAccessGranted={onAccessGranted} onLoginRequest={jest.fn()} />);

        // Open Modal
        const openModalBtn = screen.getByText('Continue as Guest');
        await user.click(openModalBtn);

        // Wait for modal to appear
        const input = await screen.findByPlaceholderText('enter@email.com');
        const submitBtn = await screen.findByText('Start Chatting');

        await user.type(input, 'valid@example.com');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                email: 'valid@example.com'
            }));
            expect(onAccessGranted).toHaveBeenCalledWith('valid@example.com');
        });
    });
});
