import { render, screen } from '@testing-library/react';
import { LaunchSpotlight } from './LaunchSpotlight';

describe('LaunchSpotlight', () => {
    it('shows the live badge and links to WeddingSteward.com in a new tab', () => {
        render(<LaunchSpotlight />);
        expect(screen.getByText(/Live in Production/i)).toBeInTheDocument();
        const cta = screen.getByRole('link', { name: /Visit WeddingSteward\.com/i });
        expect(cta).toHaveAttribute('href', 'https://weddingsteward.com');
        expect(cta).toHaveAttribute('target', '_blank');
        expect(cta.getAttribute('rel')).toContain('noopener');
    });

    it('applies the compact modifier', () => {
        render(<LaunchSpotlight compact />);
        expect(screen.getByTestId('launch-spotlight')).toHaveClass('launch-spotlight--compact');
    });
});
