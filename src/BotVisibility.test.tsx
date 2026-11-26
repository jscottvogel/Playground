// @ts-nocheck
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

// Mocks
jest.mock('@aws-amplify/ui-react', () => ({
    Authenticator: ({ children }: any) => {
        return children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test@example.com' } } });
    },
    useAuthenticator: () => ({
        user: { signInDetails: { loginId: 'test@example.com' } }
    })
}));

jest.mock('./features/chatbot/ScottBot', () => ({
    ScottBot: () => <div data-testid="meet-me-bot">Scott-bot 🤖</div>
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

jest.mock('./features/contact/ContactOptions', () => ({
    ContactOptions: () => <div data-testid="contact-options">Contact Options</div>
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

describe('Chatbot Visibility', () => {
    test('Scenario 1: Visible to Guests after email', async () => {
        await renderApp();
        // Start at gateway
        await click(screen.getByText('Enter as Guest'));
        // Should be visible
        expect(screen.getByTestId('meet-me-bot')).toBeInTheDocument();
    });

    test('Scenario 2: Visible to Authenticated Users', async () => {
        await renderApp();
        // Click Login to go to auth view
        await click(screen.getByText('Login'));
        // Should be visible (alongside Gallery)
        expect(screen.getByTestId('meet-me-bot')).toBeInTheDocument();
        expect(screen.getByText('Project Gallery')).toBeInTheDocument();
    });

    test('Scenario 3: Visible to Admins', async () => {
        await renderApp();
        // Login
        await click(screen.getByText('Login'));
        // Click Admin Nav
        await click(screen.getByText('Admin Portal'));
        // Should be visible (alongside Admin Dashboard)
        expect(screen.getByTestId('meet-me-bot')).toBeInTheDocument();
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
});
