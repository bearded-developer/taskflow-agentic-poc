export type Priority = 'low' | 'medium' | 'high';
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  completed?: boolean;
}
