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

describe('App Navigation Flow', () => {
    test('renders GuestGateway by default', () => {
        render(<App />);
        expect(screen.getByTestId('guest-gateway')).toBeInTheDocument();
    });

    test('navigates to guest chat when access granted', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Enter as Guest'));
        expect(screen.getByText('Meet Me Chatbot 🤖')).toBeInTheDocument();
        // Check if Nav is present
        expect(screen.getByText('Vogel Solutions Lab')).toBeInTheDocument();
    });

    test('navigates to auth view when login requested', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Login'));
        // Since we mock Authenticator to render children, we should see authenticated content
        expect(screen.getByTestId('project-gallery')).toBeInTheDocument();
        // Also check if Admin button is present now that we are logged in
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });
});
