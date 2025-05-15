const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database for todos
let todos = [];
let nextId = 1;

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Get a specific todo
app.get('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json(todo);
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { title, completed } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTodo = {
    id: nextId++,
    title,
    completed: completed || false,
    createdAt: new Date()
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const { title, completed } = req.body;
  
  if (title !== undefined && title.trim() === '') {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    title: title !== undefined ? title : todos[todoIndex].title,
    completed: completed !== undefined ? completed : todos[todoIndex].completed,
    updatedAt: new Date()
  };
  
  todos[todoIndex] = updatedTodo;
  res.json(updatedTodo);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  const deletedTodo = todos[todoIndex];
  todos.splice(todoIndex, 1);
  
  res.json(deletedTodo);
});

// For testing purposes, export the app without starting the server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Todo app listening at http://localhost:${port}`);
  });
}

module.exports = { app, resetData: () => { todos = []; nextId = 1; } }; 