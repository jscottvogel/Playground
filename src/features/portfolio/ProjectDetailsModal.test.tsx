import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectDetailsModal } from './ProjectDetailsModal';

const mockProject = {
    id: '1',
    title: 'Our Wedding',
    description: 'Test description of our wedding app.',
    imageUrl: 'test.jpg',
    demoUrl: 'http://test-wedding.com',
    gitUrl: 'http://github.com/test-wedding',
    skills: ['React', 'Amplify']
};

describe('ProjectDetailsModal', () => {
    test('renders case study tab by default and displays case study content', () => {
        render(<ProjectDetailsModal project={mockProject as any} onClose={jest.fn()} />);
        
        // Modal title should be present
        expect(screen.getByText('Our Wedding')).toBeInTheDocument();
        
        // Case Study tab should be active by default and display the case study content
        expect(screen.getByText('Executive Summary')).toBeInTheDocument();
        expect(screen.getByText(/Wedding Steward is a serverless SaaS incubator/)).toBeInTheDocument();
        
        // Tech Specs tab should not be showing content initially
        expect(screen.queryByText('Concept Description')).not.toBeInTheDocument();
    });

    test('switches to tech specs tab on click', () => {
        render(<ProjectDetailsModal project={mockProject as any} onClose={jest.fn()} />);
        
        const techSpecsBtn = screen.getByText('⚙️ Tech Specs');
        fireEvent.click(techSpecsBtn);
        
        // Tech Specs tab should show content
        expect(screen.getByText('Concept Description')).toBeInTheDocument();
        expect(screen.getByText('Test description of our wedding app.')).toBeInTheDocument();
        
        // Case Study content should be hidden
        expect(screen.queryByText('Executive Summary')).not.toBeInTheDocument();
    });
});
