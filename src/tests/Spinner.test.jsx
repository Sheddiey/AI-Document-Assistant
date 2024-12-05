import { render, screen } from '@testing-library/react';
import SpinnerOverlay from '../components/Spinner';

describe('SpinnerOverlay', () => {
  it('renders spinner with text when text prop is provided', () => {
    render(<SpinnerOverlay text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders spinner without text when text prop is not provided', () => {
    render(<SpinnerOverlay />);
    expect(screen.queryByText(/Loading data.../)).not.toBeInTheDocument();
  });
});
