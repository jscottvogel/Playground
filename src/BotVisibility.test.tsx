// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mocks
jest.mock('@aws-amplify/ui-react', () => ({
    Authenticator: ({ children }: any) => {
        return children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test@example.com' } } });
    },
    useAuthenticator: () => ({
        user: { signInDetails: { loginId: 'test@example.com' } }
    })
}));

jest.mock('./features/chatbot/MeetMeBot', () => ({
    MeetMeBot: () => <div data-testid="meet-me-bot">Meet Me Chatbot 🤖</div>
}));

jest.mock('./features/guest/GuestGateway', () => ({
    GuestGateway: ({ onAccessGranted, onLoginRequest }: any) => (
        <div data-testid="guest-gateway">
            <button onClick={() => onAccessGranted('guest@example.com')}>Enter as Guest</button>
            <button onClick={onLoginRequest}>Login</button>
        </div>
    )
}));

jest.mock('./features/admin/AdminDashboard', () => ({
    AdminDashboard: () => <div>Admin Dashboard</div>
}));

jest.mock('./features/portfolio/ProjectGallery', () => ({
    ProjectGallery: () => <div>Project Gallery</div>
}));

jest.mock('./services/Logger', () => ({
    AuthLogger: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('aws-amplify/utils', () => ({
    Hub: {
        listen: jest.fn(() => () => { })
    }
}));

describe('Chatbot Visibility', () => {
    test('Scenario 1: Visible to Guests after email', () => {
        render(<App />);
        // Start at gateway
        fireEvent.click(screen.getByText('Enter as Guest'));
        // Should be visible
        expect(screen.getByTestId('meet-me-bot')).toBeInTheDocument();
    });

    test('Scenario 2: Visible to Authenticated Users', () => {
        render(<App />);
        // Click Login to go to auth view
        fireEvent.click(screen.getByText('Login'));
        // Should be visible (alongside Gallery)
        expect(screen.getByTestId('meet-me-bot')).toBeInTheDocument();
        expect(screen.getByText('Project Gallery')).toBeInTheDocument();
    });

    test('Scenario 3: Visible to Admins', () => {
        render(<App />);
        // Login
        fireEvent.click(screen.getByText('Login'));
        // Click Admin Nav
        fireEvent.click(screen.getByText('Admin Portal'));
        // Should be visible (alongside Admin Dashboard)
        expect(screen.getByTestId('meet-me-bot')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
});
