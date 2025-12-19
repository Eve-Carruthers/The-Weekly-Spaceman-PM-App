// Simple Node.js backend for The Weekly Spaceman project management app
//
// This Express server provides a REST API for managing tasks used by the
// React Kanban board component. It stores tasks in memory and supports
// basic CRUD operations. In a production environment, you would replace
// the in‑memory store with a database (e.g. PostgreSQL, MongoDB) and add
// authentication and authorization. CORS is enabled so the React front‑end
// (running on a different port during development) can communicate with
// this API without issues.

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for all routes. Adjust the origin as needed.
app.use(cors({ origin: '*' }));

// Parse JSON request bodies
app.use(express.json());

// In-memory store for tasks. Each task has the following shape:
// {
//   id: string,
//   title: string,
//   description: string,
//   assignee: string,
//   dueDate: string (ISO 8601 date),
//   status: string (e.g. "Idea", "Assigned", "Drafting", etc.)
// }
const tasks = [];

// GET /tasks
// Returns all tasks. Optional query parameters can filter by status or assignee.
app.get('/tasks', (req, res) => {
  const { status, assignee } = req.query;
  let filteredTasks = tasks;
  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  if (assignee) {
    filteredTasks = filteredTasks.filter(task => task.assignee === assignee);
  }
  res.json(filteredTasks);
});

// POST /tasks
// Creates a new task. Expects a JSON body with title and status; other
// fields (description, assignee, dueDate) are optional.
app.post('/tasks', (req, res) => {
  const { title, description = '', assignee = '', dueDate = '', status = 'Idea' } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTask = {
    id: uuidv4(),
    title,
    description,
    assignee,
    dueDate,
    status,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id
// Updates an existing task. The request body can include any subset of task
// fields (title, description, assignee, dueDate, status). Returns the updated
// task or 404 if no task is found with the given ID.
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const existingTask = tasks[taskIndex];
  const updatedTask = { ...existingTask, ...req.body, id: existingTask.id };
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// DELETE /tasks/:id
// Deletes a task by ID. Returns a success message or 404 if not found.
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted' });
});

// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Task API server running on http://localhost:${port}`);
});