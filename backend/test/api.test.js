const request = require('supertest');
const AWS = require('aws-sdk-mock');

let app;

describe('API Endpoints', () => {
	beforeAll(() => {
		AWS.mock('DynamoDB.DocumentClient', 'scan', {
			Items: [
				{
					id: 'test-1',
					text: 'Test todo',
					completed: false,
					priority: 'medium',
					createdAt: new Date().toISOString(),
				},
			],
			Count: 1,
		});

		AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
			callback(null, {});
		});

		AWS.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
			callback(null, {
				Attributes: {
					id: params.Key.id,
					text: 'Updated todo',
					completed: true,
					priority: 'high',
					updatedAt: new Date().toISOString(),
				},
			});
		});

		AWS.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
			callback(null, {
				Attributes: {
					id: params.Key.id,
					text: 'Deleted todo',
				},
			});
		});

		app = require('../server');
	});

	afterAll(async () => {
		AWS.restore('DynamoDB.DocumentClient');

		if (app && app.close) {
			await new Promise((resolve) => {
				app.close(resolve);
			});
		}
	});

	describe('GET /api/health', () => {
		test('should return health status', async () => {
			const response = await request(app).get('/api/health').expect(200);

			expect(response.body).toHaveProperty('status', 'OK');
			expect(response.body).toHaveProperty('service', 'backend-test');
			expect(response.body).toHaveProperty('timestamp');
			expect(response.body).toHaveProperty('environment');
		});
	});

	describe('GET /api/metrics', () => {
		test('should return application metrics', async () => {
			const response = await request(app).get('/api/metrics').expect(200);

			expect(response.body).toHaveProperty('uptime_seconds');
			expect(response.body).toHaveProperty('memory_usage');
			expect(response.body).toHaveProperty('environment');
			expect(response.body).toHaveProperty('version');
		});
	});

	describe('GET /api/todos', () => {
		test('should return list of todos', async () => {
			const response = await request(app).get('/api/todos').expect(200);

			expect(response.body).toHaveProperty('success', true);
			expect(response.body).toHaveProperty('data');
			expect(response.body).toHaveProperty('count');
			expect(Array.isArray(response.body.data)).toBe(true);
		});
	});

	describe('POST /api/todos', () => {
		test('should create a new todo', async () => {
			const newTodo = {
				text: 'Test new todo',
				priority: 'high',
			};

			const response = await request(app).post('/api/todos').send(newTodo).expect(201);

			expect(response.body).toHaveProperty('success', true);
			expect(response.body).toHaveProperty('data');
			expect(response.body.data).toHaveProperty('text', newTodo.text);
			expect(response.body.data).toHaveProperty('priority', newTodo.priority);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data).toHaveProperty('completed', false);
		});

		test('should reject todo without text', async () => {
			const response = await request(app).post('/api/todos').send({ priority: 'low' }).expect(400);

			expect(response.body).toHaveProperty('success', false);
			expect(response.body).toHaveProperty('error', 'Text is required');
		});
	});

	describe('PUT /api/todos/:id', () => {
		test('should update existing todo', async () => {
			const updates = {
				text: 'Updated todo text',
				completed: true,
				priority: 'high',
			};

			const response = await request(app).put('/api/todos/test-1').send(updates).expect(200);

			expect(response.body).toHaveProperty('success', true);
			expect(response.body).toHaveProperty('data');
		});
	});

	describe('DELETE /api/todos/:id', () => {
		test('should delete existing todo', async () => {
			const response = await request(app).delete('/api/todos/test-1').expect(200);

			expect(response.body).toHaveProperty('success', true);
		});
	});

	describe('Error handling', () => {
		test('should return 404 for unknown routes', async () => {
			const response = await request(app).get('/api/unknown').expect(404);

			expect(response.body).toHaveProperty('success', false);
			expect(response.body).toHaveProperty('error', 'Route not found');
		});
	});
});
