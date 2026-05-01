import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const colorMap: Record<Priority, string> = {
  low: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
};

export function PriorityBadge({ priority }: PriorityBadgeProps): React.ReactElement {
  return (
    <span
      style={{
        backgroundColor: colorMap[priority],
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'capitalize',
      }}
      aria-label={`Priority: ${priority}`}
    >
      {priority}
    </span>
  );
}
