import React from 'react';
import { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete?: (id: number, completed: boolean) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function TaskList({ tasks, onToggleComplete, onDelete }: TaskListProps): React.ReactElement {
  if (tasks.length === 0) {
    return <p>No tasks yet. Create one above!</p>;
  }

  return (
    <ul aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id} style={{ marginBottom: '1rem', listStyle: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete?.(task.id, !task.completed)}
              aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <span
              style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
            >
              {task.title}
            </span>
            <PriorityBadge priority={task.priority} />
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                aria-label={`Delete "${task.title}"`}
              >
                Delete
              </button>
            )}
          </div>
          {task.description && (
            <p style={{ marginLeft: '1.5rem', color: '#666', fontSize: '0.875rem' }}>
              {task.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
