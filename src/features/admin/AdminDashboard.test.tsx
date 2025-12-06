// @ts-nocheck
import { render, screen } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';

// Simple mocks to just allow rendering
jest.mock('@aws-amplify/ui-react', () => ({
    useAuthenticator: () => ({
        user: { signInDetails: { loginId: 'admin@test.com' } }
    }),
    Authenticator: ({ children }: any) => <div>{children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test' } } })}</div>
}));

jest.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        models: {
            Project: {
                create: jest.fn()
            }
        }
    })
}));

describe('AdminDashboard', () => {
    test('renders form inputs', () => {
        render(<AdminDashboard />);
        expect(screen.getByLabelText(/Project Title/i)).toBeInTheDocument();
    });
});
