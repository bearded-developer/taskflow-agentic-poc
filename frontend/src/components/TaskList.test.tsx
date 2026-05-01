import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';
import { Task } from '../types';
import { describe, it, expect } from 'vitest';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Low priority task',
    description: null,
    priority: 'low',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'High priority task',
    description: 'With description',
    priority: 'high',
    completed: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('TaskList', () => {
  it('renders empty state message when no tasks', () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders tasks with priority badges', () => {
    render(<TaskList tasks={mockTasks} />);
    expect(screen.getByText('Low priority task')).toBeInTheDocument();
    expect(screen.getByText('High priority task')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('shows task description when present', () => {
    render(<TaskList tasks={mockTasks} />);
    expect(screen.getByText('With description')).toBeInTheDocument();
  });

  it('shows strike-through for completed tasks', () => {
    render(<TaskList tasks={mockTasks} />);
    const completedTitle = screen.getByText('High priority task');
    expect(completedTitle).toHaveStyle({ textDecoration: 'line-through' });
  });
});
