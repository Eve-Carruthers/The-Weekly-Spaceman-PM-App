// Simple Node.js backend for The Weekly Spaceman project management app
//
// This Express server provides a REST API for managing tasks used by the
// React Kanban board component. It stores tasks in memory and supports
// basic CRUD operations. In a production environment, you would replace
// the in-memory store with a database (e.g. PostgreSQL, MongoDB) and add
// authentication and authorization. CORS is enabled so the React front-end
// (running on a different port during development) can communicate with
// this API without issues.

const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 4000;

// Valid workflow statuses for The Weekly Spaceman content pipeline
const VALID_STATUSES = [
  'Idea',
  'Assigned',
  'Drafting',
  'Editing',
  'Fact-Check',
  'Scheduled',
  'Published',
];

// Enable CORS for all routes. Adjust the origin as needed for production.
app.use(cors({ origin: '*' }));

// Parse JSON request bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for tasks. Each task has the following shape:
// {
//   id: string,
//   title: string,
//   description: string,
//   assignee: string,
//   dueDate: string (ISO 8601 date),
//   status: string (one of VALID_STATUSES)
// }
const tasks = [];

// GET /api/statuses
// Returns the list of valid workflow statuses
app.get('/api/statuses', (req, res) => {
  res.json(VALID_STATUSES);
});

// GET /tasks
// Returns all tasks. Optional query parameters can filter by status or assignee.
app.get('/tasks', (req, res) => {
  try {
    const { status, assignee } = req.query;
    let filteredTasks = tasks;

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (assignee) {
      filteredTasks = filteredTasks.filter(task =>
        task.assignee.toLowerCase().includes(assignee.toLowerCase())
      );
    }

    res.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /tasks
// Creates a new task. Expects a JSON body with title; other fields optional.
app.post('/tasks', (req, res) => {
  try {
    const { title, description = '', assignee = '', dueDate = '', status = 'Idea' } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }

    // Validate title length
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    // Validate description length
    if (description && description.length > 2000) {
      return res.status(400).json({ error: 'Description must be 2000 characters or less' });
    }

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    // Validate date format if provided
    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Invalid date format for dueDate' });
    }

    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim(),
      dueDate,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /tasks/:id
// Updates an existing task. The request body can include any subset of task
// fields (title, description, assignee, dueDate, status). Returns the updated
// task or 404 if no task is found with the given ID.
app.put('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, assignee, dueDate, status } = req.body;

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title must be a non-empty string' });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: 'Title must be 200 characters or less' });
      }
    }

    // Validate description if provided
    if (description !== undefined && description.length > 2000) {
      return res.status(400).json({ error: 'Description must be 2000 characters or less' });
    }

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    // Validate date format if provided
    if (dueDate !== undefined && dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Invalid date format for dueDate' });
    }

    const existingTask = tasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      ...req.body,
      id: existingTask.id,
      createdAt: existingTask.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // Trim string fields
    if (updatedTask.title) updatedTask.title = updatedTask.title.trim();
    if (updatedTask.description) updatedTask.description = updatedTask.description.trim();
    if (updatedTask.assignee) updatedTask.assignee = updatedTask.assignee.trim();

    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /tasks/:id
// Deletes a task by ID. Returns a success message or 404 if not found.
app.delete('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.json({ message: 'Task deleted', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the frontend app for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback route for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`The Weekly Spaceman PM App running on http://localhost:${port}`);
  console.log(`API endpoints available at http://localhost:${port}/tasks`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please use a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
