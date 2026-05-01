import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';
import { describe, it, expect, vi } from 'vitest';

describe('TaskForm', () => {
  it('renders the priority dropdown with correct options', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    const select = screen.getByLabelText('Priority');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Low' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'High' })).toBeInTheDocument();
  });

  it('defaults priority to medium', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    const select = screen.getByLabelText('Priority') as HTMLSelectElement;
    expect(select.value).toBe('medium');
  });

  it('calls onSubmit with form data including priority', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Title'), 'Test Task');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        priority: 'high',
        description: undefined,
      });
    });
  });

  it('resets form after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);
    const user = userEvent.setup();
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    await user.type(titleInput, 'My Task');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));
    await waitFor(() => {
      expect(titleInput.value).toBe('');
    });
  });
});
