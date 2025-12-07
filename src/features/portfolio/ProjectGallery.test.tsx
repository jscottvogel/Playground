// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectGallery } from './ProjectGallery';

const mockList = jest.fn();
const mockCreate = jest.fn();

jest.mock('aws-amplify/data', () => ({
    generateClient: () => ({
        models: {
            Project: {
                list: (...args: any[]) => mockList(...args),
                create: (...args: any[]) => mockCreate(...args)
            }
        }
    })
}));

jest.mock('../../services/Logger', () => ({
    GalleryLogger: {
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn()
    }
}));

describe('ProjectGallery', () => {
    beforeEach(() => {
        mockList.mockClear();
        mockCreate.mockClear();
    });

    test('renders empty state when no projects', async () => {
        mockList.mockResolvedValue({ data: [] } as any);
        render(<ProjectGallery />);
        expect(await screen.findByText(/No projects found/)).toBeInTheDocument();
    });

    test('renders projects with skills and links', async () => {
        mockList.mockResolvedValue({
            data: [{
                id: '1',
                title: 'Test Project',
                description: 'Test Desc',
                imageUrl: 'test.jpg',
                demoUrl: 'http://test.com',
                gitUrl: 'http://github.com',
                skills: ['React', 'Vitest']
            }] as any
        });

        render(<ProjectGallery />);
        expect(await screen.findByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Vitest')).toBeInTheDocument();

        const demoLink = screen.getByText('Live Demo');
        expect(demoLink).toHaveAttribute('href', 'http://test.com');

        const gitLink = screen.getByText('GitHub');
        expect(gitLink).toHaveAttribute('href', 'http://github.com');
    });
});
