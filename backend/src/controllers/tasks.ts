import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateTaskSchema, UpdateTaskSchema } from '../validators/tasks';
import logger from '../logger';

const prisma = new PrismaClient();

export async function getAllTasks(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = CreateTaskSchema.parse(req.body);
    const task = await prisma.task.create({ data });
    logger.info('Task created', { taskId: task.id });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    const data = UpdateTaskSchema.parse(req.body);
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const task = await prisma.task.update({ where: { id }, data });
    logger.info('Task updated', { taskId: task.id });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    await prisma.task.delete({ where: { id } });
    logger.info('Task deleted', { taskId: id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
