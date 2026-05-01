import React, { useEffect, useState } from 'react';
import type { Task, CreateTaskInput } from '@shared/types';
import { fetchTasks, createTask, updateTask, deleteTask } from './api/tasks';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';

export default function App(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (input: CreateTaskInput): Promise<void> => {
    const task = await createTask(input);
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleComplete = async (id: number, completed: boolean): Promise<void> => {
    const updated = await updateTask(id, { completed });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: number): Promise<void> => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main>
      <h1>TaskFlow</h1>
      <TaskForm onSubmit={handleCreate} />
      {loading && <p>Loading tasks...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && (
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
