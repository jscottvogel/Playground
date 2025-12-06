import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectGallery } from './ProjectGallery';

const mockList = jest.fn();
const mockCreate = jest.fn();

jest.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        models: {
            Project: {
                list: mockList,
                create: mockCreate
            }
        }
    })
}));

describe('ProjectGallery', () => {
    beforeEach(() => {
        mockList.mockClear();
        mockCreate.mockClear();
    });

    test('renders empty state with seed button', async () => {
        mockList.mockResolvedValue({ data: [] });
        render(<ProjectGallery />);
        expect(await screen.findByText(/Click "Seed Database"/)).toBeInTheDocument();
        expect(screen.getByText('Seed Database')).toBeInTheDocument();
    });

    test('seeds data when button clicked', async () => {
        mockList.mockResolvedValueOnce({ data: [] }); // Initial
        render(<ProjectGallery />);

        const seedBtn = await screen.findByText('Seed Database');
        fireEvent.click(seedBtn);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
        });
    });

    test('renders projects when data exists', async () => {
        mockList.mockResolvedValue({
            data: [{
                id: '1',
                title: 'Test Project',
                description: 'Test Desc',
                imageUrl: 'test.jpg',
                demoUrl: 'http://test.com',
                gitUrl: 'http://github.com'
            }]
        });

        render(<ProjectGallery />);
        expect(await screen.findByText('Test Project')).toBeInTheDocument();
        expect(screen.queryByText('Seed Database')).toBeDisabled();
    });
});
