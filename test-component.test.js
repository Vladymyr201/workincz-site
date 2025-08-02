import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TestComponent from './test-component.tsx';

describe('TestComponent', () => {
    it('renders with title', () => {
        render(<TestComponent title="Test Title" />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('calls onClick when button is clicked', () => {
        const handleClick = vi.fn();
        render(<TestComponent title="Test" onClick={handleClick} />);
        
        fireEvent.click(screen.getByTestId('test-button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});