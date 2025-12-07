import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    test('shows error on invalid email', async () => {
        render(<GuestGateway onAccessGranted={jest.fn()} onLoginRequest={jest.fn()} />);

        const input = screen.getByPlaceholderText('enter@email.com');
        const button = screen.getByText('Continue as Guest');

        fireEvent.change(input, { target: { value: 'invalid-email' } });
        fireEvent.click(button);

        expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    test('calls access granted and saves visit on valid email', async () => {
        const onAccessGranted = jest.fn();

        render(<GuestGateway onAccessGranted={onAccessGranted} onLoginRequest={jest.fn()} />);

        const input = screen.getByPlaceholderText('enter@email.com');
        const button = screen.getByText('Continue as Guest');

        fireEvent.change(input, { target: { value: 'valid@example.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                email: 'valid@example.com'
            }));
            expect(onAccessGranted).toHaveBeenCalledWith('valid@example.com');
        });
    });
});
