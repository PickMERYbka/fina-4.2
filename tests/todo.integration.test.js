const { app, resetData } = require('../index');
const request = require('supertest');

// Reset data before each test
beforeEach(() => {
  resetData();
});

describe('Todo API Integration Tests', () => {
  test('Complete CRUD flow for a todo item', async () => {
    // Create a new todo
    const createResponse = await request(app)
      .post('/api/todos')
      .send({ title: 'Integration Test Todo' });
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Integration Test Todo');
    expect(createResponse.body.completed).toBe(false);
    
    const todoId = createResponse.body.id;
    
    // Verify the todo was created by getting all todos
    const getAllResponse = await request(app).get('/api/todos');
    expect(getAllResponse.status).toBe(200);
    expect(getAllResponse.body.length).toBe(1);
    expect(getAllResponse.body[0].id).toBe(todoId);
    
    // Get the specific todo
    const getResponse = await request(app).get(`/api/todos/${todoId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(todoId);
    expect(getResponse.body.title).toBe('Integration Test Todo');
    
    // Update the todo
    const updateResponse = await request(app)
      .put(`/api/todos/${todoId}`)
      .send({ title: 'Updated Integration Test Todo', completed: true });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe('Updated Integration Test Todo');
    expect(updateResponse.body.completed).toBe(true);
    
    // Verify the update
    const getUpdatedResponse = await request(app).get(`/api/todos/${todoId}`);
    expect(getUpdatedResponse.status).toBe(200);
    expect(getUpdatedResponse.body.title).toBe('Updated Integration Test Todo');
    expect(getUpdatedResponse.body.completed).toBe(true);
    
    // Delete the todo
    const deleteResponse = await request(app).delete(`/api/todos/${todoId}`);
    expect(deleteResponse.status).toBe(200);
    
    // Verify the deletion
    const getDeletedResponse = await request(app).get(`/api/todos/${todoId}`);
    expect(getDeletedResponse.status).toBe(404);
    
    const getAllAfterDeleteResponse = await request(app).get('/api/todos');
    expect(getAllAfterDeleteResponse.status).toBe(200);
    expect(getAllAfterDeleteResponse.body.length).toBe(0);
  });
  
  test('Managing multiple todos', async () => {
    // Create three todos
    const todo1 = await request(app)
      .post('/api/todos')
      .send({ title: 'First Todo' });
    
    const todo2 = await request(app)
      .post('/api/todos')
      .send({ title: 'Second Todo' });
    
    const todo3 = await request(app)
      .post('/api/todos')
      .send({ title: 'Third Todo' });
    
    // Get all todos and verify count
    const getAllResponse = await request(app).get('/api/todos');
    expect(getAllResponse.status).toBe(200);
    expect(getAllResponse.body.length).toBe(3);
    
    // Complete the second todo
    await request(app)
      .put(`/api/todos/${todo2.body.id}`)
      .send({ completed: true });
    
    // Delete the first todo
    await request(app).delete(`/api/todos/${todo1.body.id}`);
    
    // Get all todos and verify state
    const updatedGetAllResponse = await request(app).get('/api/todos');
    expect(updatedGetAllResponse.status).toBe(200);
    expect(updatedGetAllResponse.body.length).toBe(2);
    
    // Find the completed todo
    const completedTodo = updatedGetAllResponse.body.find(todo => todo.completed);
    expect(completedTodo).toBeTruthy();
    expect(completedTodo.id).toBe(todo2.body.id);
    expect(completedTodo.title).toBe('Second Todo');
  });
}); 