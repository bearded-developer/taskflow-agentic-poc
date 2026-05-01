process.env.DATABASE_URL = 'file:./test.db';

import { execSync } from 'child_process';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';

const prisma = new PrismaClient();
const app = createApp();
const request = supertest(app);

beforeAll(() => {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
});

beforeEach(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/tasks', () => {
  it('creates a task with default priority', async () => {
    const res = await request.post('/api/tasks').send({ title: 'Test Task' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Task');
    expect(res.body.priority).toBe('medium');
    expect(res.body.completed).toBe(false);
  });

  it('creates a task with explicit priority', async () => {
    const res = await request
      .post('/api/tasks')
      .send({ title: 'High Priority Task', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('high');
  });

  it('returns 400 for missing title', async () => {
    const res = await request.post('/api/tasks').send({ priority: 'low' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid priority', async () => {
    const res = await request
      .post('/api/tasks')
      .send({ title: 'Task', priority: 'urgent' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks', () => {
  it('returns an empty list initially', async () => {
    const res = await request.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns list with tasks', async () => {
    await request.post('/api/tasks').send({ title: 'Task 1', priority: 'low' });
    await request.post('/api/tasks').send({ title: 'Task 2', priority: 'high' });
    const res = await request.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns a specific task', async () => {
    const created = await request
      .post('/api/tasks')
      .send({ title: 'Specific Task', priority: 'medium' });
    const res = await request.get(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Specific Task');
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request.get('/api/tasks/99999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates priority', async () => {
    const created = await request
      .post('/api/tasks')
      .send({ title: 'Update Me', priority: 'low' });
    const res = await request
      .patch(`/api/tasks/${created.body.id}`)
      .send({ priority: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('high');
  });

  it('marks task as completed', async () => {
    const created = await request
      .post('/api/tasks')
      .send({ title: 'Complete Me', priority: 'medium' });
    const res = await request
      .patch(`/api/tasks/${created.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request
      .patch('/api/tasks/99999')
      .send({ priority: 'low' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await request
      .post('/api/tasks')
      .send({ title: 'Delete Me', priority: 'low' });
    const res = await request.delete(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(204);
    const check = await request.get(`/api/tasks/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request.delete('/api/tasks/99999');
    expect(res.status).toBe(404);
  });
});
