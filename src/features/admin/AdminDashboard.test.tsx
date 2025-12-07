// React import removed as it is unused in this scope


// Common deps
let render: any, screen: any, fireEvent: any, waitFor: any;
let AdminDashboard: any;
let mockList: any, mockCreate: any, mockUpdate: any, mockDelete: any;

describe('AdminDashboard', () => {
    beforeEach(async () => {
        jest.resetModules();
        mockList = jest.fn();
        mockCreate = jest.fn();
        mockUpdate = jest.fn();
        mockDelete = jest.fn();

        jest.doMock('aws-amplify/data', () => ({
            generateClient: () => ({
                models: {
                    Project: {
                        list: mockList,
                        create: mockCreate,
                        update: mockUpdate,
                        delete: mockDelete
                    }
                }
            })
        }));

        jest.doMock('@aws-amplify/ui-react', () => ({
            useAuthenticator: () => ({
                user: { signInDetails: { loginId: 'admin@test.com' } }
            }),
            Authenticator: ({ children }: any) => <div>{children({ signOut: jest.fn(), user: { signInDetails: { loginId: 'test' } } })}</div>
        }));

        jest.doMock('../../services/Logger', () => ({
            AdminLogger: {
                debug: jest.fn(),
                info: jest.fn(),
                error: jest.fn()
            }
        }));

        const rtl = await import('@testing-library/react');
        render = rtl.render;
        screen = rtl.screen;
        fireEvent = rtl.fireEvent;
        waitFor = rtl.waitFor;

        const mod = await import('./AdminDashboard');
        AdminDashboard = mod.AdminDashboard;

        // Mock window methods
        window.scrollTo = jest.fn();
        window.confirm = jest.fn(() => true);
    });

    test('renders form and loads projects', async () => {
        mockList.mockResolvedValue({ data: [{ id: '1', title: 'Existing Project' }] });
        render(<AdminDashboard />);
        expect(screen.getByText('Add New Project')).toBeInTheDocument();
        expect(await screen.findByText('Existing Project')).toBeInTheDocument();
    });

    test('creates a project', async () => {
        mockList.mockResolvedValue({ data: [] });
        mockCreate.mockResolvedValue({ data: { id: 'new' } });
        render(<AdminDashboard />);

        fireEvent.change(screen.getByLabelText(/Project Title/i), { target: { value: 'New App' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Desc' } });
        fireEvent.change(screen.getByLabelText(/Image URL/i), { target: { value: 'http://img.com' } });
        fireEvent.change(screen.getByLabelText(/demo URL/i), { target: { value: 'http://demo.com' } });
        fireEvent.change(screen.getByLabelText(/GitHub URL/i), { target: { value: 'http://git.com' } });

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
