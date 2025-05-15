const { app, resetData } = require('../index');
const request = require('supertest');

// Reset data before each test
beforeEach(() => {
  resetData();
});

describe('Todo API Unit Tests', () => {
  // Test suite for GET /api/todos endpoint
  describe('GET /api/todos', () => {
    test('should return an empty array initially', async () => {
      const response = await request(app).get('/api/todos');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should return all todos', async () => {
      // Add a todo first
      await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });
      
      const response = await request(app).get('/api/todos');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Test Todo');
    });
  });

  // Test suite for GET /api/todos/:id endpoint
  describe('GET /api/todos/:id', () => {
    test('should return 404 for non-existent todo', async () => {
      const response = await request(app).get('/api/todos/999');
      expect(response.status).toBe(404);
    });

    test('should return a specific todo', async () => {
      // Add a todo first
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });
      
      const todoId = createResponse.body.id;
      
      const response = await request(app).get(`/api/todos/${todoId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      expect(response.body.title).toBe('Test Todo');
    });
  });

  // Test suite for POST /api/todos endpoint
  describe('POST /api/todos', () => {
    test('should create a new todo', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('Test Todo');
      expect(response.body.completed).toBe(false);
    });

    test('should reject todo creation without title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ completed: false });
      
      expect(response.status).toBe(400);
    });

    test('should reject todo creation with empty title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' });
      
      expect(response.status).toBe(400);
    });
  });

  // Test suite for PUT /api/todos/:id endpoint
  describe('PUT /api/todos/:id', () => {
    test('should update a todo', async () => {
      // Create a todo first
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });
      
      const todoId = createResponse.body.id;
      
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Todo', completed: true });
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      expect(response.body.title).toBe('Updated Todo');
      expect(response.body.completed).toBe(true);
    });

    test('should return 404 for updating non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/999')
        .send({ title: 'Updated Todo' });
      
      expect(response.status).toBe(404);
    });

    test('should reject update with empty title', async () => {
      // Create a todo first
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });
      
      const todoId = createResponse.body.id;
      
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: '' });
      
      expect(response.status).toBe(400);
    });
  });

  // Test suite for DELETE /api/todos/:id endpoint
  describe('DELETE /api/todos/:id', () => {
    test('should delete a todo', async () => {
      // Create a todo first
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });
      
      const todoId = createResponse.body.id;
      
      const response = await request(app)
        .delete(`/api/todos/${todoId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      
      // Verify it's gone
      const getResponse = await request(app).get(`/api/todos/${todoId}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for deleting non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/999');
      
      expect(response.status).toBe(404);
    });
  });
}); 