// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Hoist mocks
const mockCreate = jest.fn();
const mockList = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('aws-amplify/data', () => ({
    generateClient: jest.fn(() => ({
        models: {
            Project: {
                create: mockCreate,
                list: mockList,
                update: mockUpdate,
                delete: mockDelete
            }
        }
    }))
}));

jest.mock('@aws-amplify/ui-react', () => ({
    useAuthenticator: () => ({
        user: { signInDetails: { loginId: 'admin@test.com' } }
    }),
    Authenticator: ({ children }: any) => <div>{children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test' } } })}</div>
}));

import { AdminDashboard } from './AdminDashboard';

describe('AdminDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockList.mockResolvedValue({ data: [] }); // Default empty list
        window.scrollTo = jest.fn(); // Mock scrollTo
        window.confirm = jest.fn(() => true); // Mock confirm dialog
    });

    test('renders form and loads projects', async () => {
        mockList.mockResolvedValue({
            data: [{
                id: '1',
                title: 'Existing Project',
                description: 'Desc',
                skills: ['React']
            }]
        });

        render(<AdminDashboard />);
        expect(screen.getByText('Add New Project')).toBeInTheDocument();
        expect(await screen.findByText('Existing Project')).toBeInTheDocument();
    });

    test('creates a project', async () => {
        mockCreate.mockResolvedValue({ data: { id: 'new' } });
        render(<AdminDashboard />);

        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'New App' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Desc' } });
        // Fill others to be safe
        fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'http://img.com' } });
        fireEvent.change(screen.getByLabelText(/Live Demo/i), { target: { value: 'http://demo.com' } });
        fireEvent.change(screen.getByLabelText(/GitHub/i), { target: { value: 'http://git.com' } });

        fireEvent.click(screen.getByText('Create Project'));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
            expect(screen.getByText('Project created successfully!')).toBeInTheDocument();
        });
    });

    test('edits a project', async () => {
        mockList.mockResolvedValue({
            data: [{ id: '1', title: 'Old Title', skills: ['A'] }]
        });
        mockUpdate.mockResolvedValue({ data: { id: '1' } });

        render(<AdminDashboard />);
        const editBtn = await screen.findByText('Edit');
        fireEvent.click(editBtn);

        expect(screen.getByText('Edit Project')).toBeInTheDocument();
        expect(screen.getByLabelText(/Project Title/i)).toHaveValue('Old Title');

        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'New Title' } });
        fireEvent.click(screen.getByText('Update Project'));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalled();
            expect(screen.getByText('Project updated successfully!')).toBeInTheDocument();
        });
    });

    test('deletes a project', async () => {
        mockList.mockResolvedValue({
            data: [{ id: '1', title: 'To Delete' }]
        });
        mockDelete.mockResolvedValue({ data: { id: '1' } });

        render(<AdminDashboard />);
        const deleteBtn = await screen.findByText('Delete');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith({ id: '1' });
            expect(screen.getByText('Project deleted.')).toBeInTheDocument();
        });
    });
});
