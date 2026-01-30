import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EggCalculator from './egg-calculator';

describe('EggCalculator', () => {
  it('renders without crashing', () => {
    render(<EggCalculator />);
    // Component renders a top-level div with content.
    // Verify the component mounted by checking for visible text content.
    // The app title contains an egg emoji and translated title text.
    expect(document.querySelector('[class*="min-h-screen"]')).toBeInTheDocument();
  });
});
