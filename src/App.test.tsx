import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock Amplify Authenticator
jest.mock('@aws-amplify/ui-react', () => ({
    Authenticator: ({ children }: any) => {
        return children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test@example.com' } } });
    },
    useAuthenticator: () => ({
        user: { signInDetails: { loginId: 'test@example.com' } },
        signOut: jest.fn()
    })
}));

// Mock feature components to isolate App logic (optional, but good for unit testing App)
// However, integration style might be better to verify flows.
// Let's mock the complex Amplify dependent ones if they are not the focus, 
// or mock the amplify client in them.
jest.mock('./features/portfolio/ProjectGallery', () => ({
    ProjectGallery: () => <div data-testid="project-gallery">Project Gallery</div>
}));

// Mock GuestGateway to trigger onAccessGranted
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

jest.mock('./features/chatbot/ScottBot', () => ({
    ScottBot: () => <div>Scott-bot 🤖</div>
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

describe('App Navigation Flow', () => {
    test('renders GuestGateway by default', () => {
        render(<App />);
        expect(screen.getByTestId('guest-gateway')).toBeInTheDocument();
    });

    test('navigates to guest chat when access granted', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Enter as Guest'));
        expect(screen.getByText('Scott-bot 🤖')).toBeInTheDocument();
        // Check if Nav is present
        expect(screen.getByText('Vogel Solutions Lab')).toBeInTheDocument();
    });

    test('navigates to auth view when login requested', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Login'));
        // Since we mock Authenticator to render children, we should see authenticated content
        expect(screen.getByTestId('project-gallery')).toBeInTheDocument();
        // Also check if Admin button is present now that we are logged in
        expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    });

    test('shows chatbot in admin view', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Login')); // Go to auth
        fireEvent.click(screen.getByText('Admin Portal')); // Go to admin
        expect(screen.getByText('Scott-bot 🤖')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    test('sign out redirects to gateway', async () => {
        render(<App />);
        fireEvent.click(screen.getByText('Login')); // Login
        expect(screen.getByText('Sign Out')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Sign Out'));

        // Should land back on Gateway
        expect(await screen.findByTestId('guest-gateway')).toBeInTheDocument();
        expect(screen.queryByText('Project Gallery')).not.toBeInTheDocument();
    });
});
