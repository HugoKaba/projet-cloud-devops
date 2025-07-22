const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const port = 3001;

const dynamodb = new AWS.DynamoDB.DocumentClient({
	region: process.env.AWS_REGION || 'eu-west-1',
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		service: 'backend-test',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
	});
});

app.get('/api/todos', async (req, res) => {
	try {
		const result = await dynamodb
			.scan({
				TableName: 'iim-project-data',
			})
			.promise();

		res.json(result.Items || []);
	} catch (error) {
		res.status(500).json({ error: 'DynamoDB connection failed' });
	}
});

app.post('/api/todos', async (req, res) => {
	try {
		const todo = {
			id: Date.now().toString(),
			text: req.body.text || 'Test todo',
			completed: false,
			createdAt: new Date().toISOString(),
		};

		await dynamodb
			.put({
				TableName: 'iim-project-data',
				Item: todo,
			})
			.promise();

		res.json(todo);
	} catch (error) {
		res.status(500).json({ error: 'Failed to create todo' });
	}
});

app.listen(port, '0.0.0.0', () => {
	console.log(`Backend test app running on port ${port}`);
});
