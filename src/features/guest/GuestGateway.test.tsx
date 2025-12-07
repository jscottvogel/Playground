import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GuestGateway } from './GuestGateway';

// Mock Amplify Data client
const mockCreate = jest.fn();

jest.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        models: {
            GuestVisit: {
                create: (...args: any[]) => mockCreate(...args)
            }
        }
    })
}));

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
        mockCreate.mockClear();
    });

    test('renders correctly', () => {
        render(<GuestGateway onAccessGranted={jest.fn()} onLoginRequest={jest.fn()} />);
        expect(screen.getByText('Welcome to Vogel Solutions')).toBeInTheDocument();
    });

    test('shows error on invalid email', async () => {
        render(<GuestGateway onAccessGranted={jest.fn()} onLoginRequest={jest.fn()} />);
        // Use placeholder because label is sr-only
        const input = screen.getByPlaceholderText('enter@email.com');
        const button = screen.getByText('Continue as Guest');

        fireEvent.change(input, { target: { value: 'invalid-email' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
        });
    });

    test('calls access granted and saves visit on valid email', async () => {
        const onAccessGranted = jest.fn();
        mockCreate.mockResolvedValue({ errors: null });

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
