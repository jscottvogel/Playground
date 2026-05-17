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

    test('calls access granted and saves visit on click', async () => {
        const onAccessGranted = jest.fn();
        const user = userEvent.setup();

        render(<GuestGateway onAccessGranted={onAccessGranted} onLoginRequest={jest.fn()} />);

        const openModalBtn = screen.getByText('Continue as Guest');
        await user.click(openModalBtn);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                email: 'Guest'
            }));
            expect(onAccessGranted).toHaveBeenCalledWith('Guest');
        });
    });
});
