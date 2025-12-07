import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';

// 1. Define mock functions (vars)
// 1. Mock 'aws-amplify/data' with a singleton to ensure reference equality
jest.mock('aws-amplify/data', () => {
    const mockList = jest.fn();
    const mockCreate = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();

    const client = {
        models: {
            Project: {
                list: mockList,
                create: mockCreate,
                update: mockUpdate,
                delete: mockDelete
            }
        }
    };

    return {
        generateClient: () => client
    };
});

// 2. Access the mocks for assertion via the imported module
import { generateClient } from 'aws-amplify/data';
const client = generateClient() as any;
const mockList = client.models.Project.list as jest.Mock;
const mockCreate = client.models.Project.create as jest.Mock;
const mockUpdate = client.models.Project.update as jest.Mock;
const mockDelete = client.models.Project.delete as jest.Mock;

// 3. Mock Logger
jest.mock('../../services/Logger', () => ({
    AdminLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn()
    }
}));

// 4. Mock Authenticator
jest.mock('@aws-amplify/ui-react', () => ({
    useAuthenticator: () => ({
        user: { signInDetails: { loginId: 'admin@test.com' } }
    }),
    Authenticator: ({ children }: any) => <div>{children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test' } } })}</div>
}));



/**
 * AdminDashboard Tests
 * 
 * Verifies the CRUD functionality of the Admin Dashboard.
 * 
 * Scope:
 * - List, Create, Update, Delete (Soft Delete) Projects.
 * - Form interactions.
 * - Notification toasts.
 * 
 * Note: Chatbot is tested separately in `MeetMeBot.test.tsx` as it is no longer part of this component.
 */
describe('AdminDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock window methods
        window.scrollTo = jest.fn();
        window.confirm = jest.fn(() => true);
    });

    test('renders form and loads projects', async () => {
        mockList.mockResolvedValue({ data: [{ id: '1', title: 'Existing Project', isActive: true }] });
        render(<AdminDashboard />);

        expect(screen.getByText('Add New Project')).toBeInTheDocument();
        // Wait for list to load
        expect(await screen.findByText('Existing Project')).toBeInTheDocument();
    });

    test('creates a project', async () => {
        mockList.mockResolvedValue({ data: [] });
        mockCreate.mockResolvedValue({ data: { id: 'new' }, errors: null });

        render(<AdminDashboard />);

        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'New App' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Desc' } });
        fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'http://img.com' } });
        fireEvent.change(screen.getByLabelText(/demo URL/i), { target: { value: 'http://demo.com' } });
        fireEvent.change(screen.getByLabelText(/GitHub URL/i), { target: { value: 'http://git.com' } });

        fireEvent.click(screen.getByText('Create Project'));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                title: 'New App',
                isActive: true
            }));
            expect(screen.getByText('Project created successfully!')).toBeInTheDocument();
        });
    });

    test('edits a project', async () => {
        mockList.mockResolvedValue({
            data: [{ id: '1', title: 'Old Title', isActive: true, skills: ['A'] }]
        });
        mockUpdate.mockResolvedValue({ data: { id: '1' }, errors: null });

        render(<AdminDashboard />);
        const editBtn = await screen.findByText('Edit');
        fireEvent.click(editBtn);

        await waitFor(() => {
            expect(screen.getByLabelText(/Project Title/i)).toHaveValue('Old Title');
        });

        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'New Title' } });
        fireEvent.click(screen.getByText('Update Project'));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalled();
            expect(screen.getByText('Project updated successfully!')).toBeInTheDocument();
        });
    });

    test('toggles project status (deactivate)', async () => {
        mockList.mockResolvedValue({
            data: [{ id: '1', title: 'To Deactivate', isActive: true }]
        });
        mockUpdate.mockResolvedValue({ data: { id: '1', isActive: false }, errors: null });

        render(<AdminDashboard />);
        const deactivateBtn = await screen.findByText('Deactivate');
        fireEvent.click(deactivateBtn);

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                id: '1',
                isActive: false
            }));
            expect(screen.getByText('Project deactivated.')).toBeInTheDocument();
        });
    });
});
