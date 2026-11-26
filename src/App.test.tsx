import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

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
    ScottBot: () => <div>LabAssistant 🧪</div>
}));

jest.mock('./services/Logger'); // uses src/services/__mocks__/Logger.ts

jest.mock('aws-amplify/utils', () => ({
    Hub: {
        listen: jest.fn(() => () => { })
    }
}));

jest.mock('aws-amplify/auth', () => ({
    getCurrentUser: jest.fn(() => Promise.reject(new Error('No active session')))
}));

/** Renders App and flushes the async auth check on mount inside act(). */
async function renderApp() {
    const utils = render(
        <MemoryRouter initialEntries={['/']}>
            <App />
        </MemoryRouter>
    );
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    return utils;
}

/** Clicks an element and lets async router/state updates settle inside act(). */
async function click(el: HTMLElement) {
    await act(async () => { fireEvent.click(el); });
}

describe('App Navigation Flow', () => {
    test('renders GuestGateway by default', async () => {
        await renderApp();
        expect(screen.getByTestId('guest-gateway')).toBeInTheDocument();
    });

    test('navigates to guest chat when access granted', async () => {
        await renderApp();
        await click(screen.getByText('Enter as Guest'));
        expect(screen.getByText('LabAssistant 🧪')).toBeInTheDocument();
        // Check if Nav is present
        expect(screen.getByText('Vogel Solutions Lab')).toBeInTheDocument();
    });

    test('navigates to auth view when login requested', async () => {
        await renderApp();
        await click(screen.getByText('Login'));
        // Since we mock Authenticator to render children, we should see authenticated content
        expect(screen.getByTestId('project-gallery')).toBeInTheDocument();
        // Also check if Admin button is present now that we are logged in
        expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    });

    test('shows chatbot in admin view', async () => {
        await renderApp();
        await click(screen.getByText('Login')); // Go to auth
        await click(screen.getByText('Admin Portal')); // Go to admin
        expect(screen.getByText('LabAssistant 🧪')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    test('sign out redirects to gateway', async () => {
        await renderApp();
        await click(screen.getByText('Login')); // Login
        expect(screen.getByText('Sign Out')).toBeInTheDocument();

        await click(screen.getByText('Sign Out'));

        // Should land back on Gateway
        expect(await screen.findByTestId('guest-gateway')).toBeInTheDocument();
        expect(screen.queryByText('Project Gallery')).not.toBeInTheDocument();
    });
});
