import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../app/page';
import '@testing-library/jest-dom';

// Mock ThemeProvider and ThemeToggle
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

jest.mock('../components/ThemeToggle', () => {
  return function DummyThemeToggle() {
    return <div data-testid="theme-toggle"></div>;
  };
});

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /my tasks/i });
    expect(heading).toBeInTheDocument();
  });

  it('allows a user to add a new task', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/e.g., buy groceries tomorrow at 5pm/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'A new test task' } });
    fireEvent.click(addButton);

    const newTask = screen.getByText('A new test task');
    expect(newTask).toBeInTheDocument();
  });

  it('parses a date from a new task and adds it to the document', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText(/e.g., buy groceries tomorrow at 5pm/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'Another task tomorrow' } });
    fireEvent.click(addButton);

    const newTask = screen.getByText('Another task');
    expect(newTask).toBeInTheDocument();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const month = tomorrow.toLocaleDateString('en-US', { month: 'short' });
    const day = tomorrow.getDate();

    const dateElement = screen.getByText(`${month} ${day}`);
    expect(dateElement).toBeInTheDocument();
  });

  it('allows a user to mark a task as complete', () => {
    render(<Home />);

    const firstTaskCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstTaskCheckbox);

    // The title of the first task is "Learn Next.js"
    const firstTask = screen.getByText('Learn Next.js');
    expect(firstTask).toHaveClass('line-through');
  });
});
