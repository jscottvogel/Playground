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

jest.mock('aws-amplify/auth', () => ({
    getCurrentUser: jest.fn(() => Promise.reject(new Error('Not authenticated')))
}));

jest.mock('../../services/Logger'); // uses src/services/__mocks__/Logger.ts

describe('ProjectGallery', () => {
    beforeEach(() => {
        mockList.mockClear();
        mockCreate.mockClear();
    });

    test('renders empty state when no projects', async () => {
        mockList.mockResolvedValue({ data: [] } as any);
        render(<ProjectGallery />);
        expect(await screen.findByText(/No experiments found/)).toBeInTheDocument();
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

        const caseStudyBtn = screen.getByText('View Case Study ↗');
        expect(caseStudyBtn).toBeInTheDocument();

        const demoLink = screen.getByText('Demo');
        expect(demoLink).toHaveAttribute('href', 'http://test.com');
        expect(screen.queryByTestId('production-badge')).not.toBeInTheDocument();
    });

    test('production projects get a Live badge, sort first, and use a Visit Site CTA', async () => {
        mockList.mockResolvedValue({
            data: [
                { id: '1', title: 'Proto App', description: 'p', demoUrl: 'http://proto.com', status: 'prototype' },
                { id: '2', title: 'Wedding Steward', description: 'w', demoUrl: 'https://weddingsteward.com', status: 'production' },
                { id: '3', title: 'Beta App', description: 'b' },
            ]
        });

        const { container } = render(<ProjectGallery />);
        expect(await screen.findByText('Wedding Steward')).toBeInTheDocument();

        const titles = Array.from(container.querySelectorAll('.project-card h3')).map(h => h.textContent);
        expect(titles).toEqual(['Wedding Steward', 'Proto App', 'Beta App']);

        const badges = screen.getAllByTestId('production-badge');
        expect(badges).toHaveLength(1);
        expect(badges[0]).toHaveTextContent('Live');
        expect(badges[0].closest('.project-card')).toHaveClass('project-card--production');

        expect(screen.getByText('Visit Site')).toHaveAttribute('href', 'https://weddingsteward.com');
        expect(screen.getByText('Demo')).toHaveAttribute('href', 'http://proto.com');
    });
});
