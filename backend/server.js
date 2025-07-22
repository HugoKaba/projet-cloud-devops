const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

AWS.config.update({
	region: process.env.AWS_REGION || 'eu-west-1',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME || 'iim-project-data';

async function getSecret(secretName) {
	if (!process.env.SECRET_NAME) {
		console.log('No secrets configured, using environment variables');
		return null;
	}

	try {
		const secretsManager = new AWS.SecretsManager({
			region: process.env.AWS_REGION || 'eu-west-1',
		});

		const data = await secretsManager
			.getSecretValue({
				SecretId: secretName,
			})
			.promise();

		return JSON.parse(data.SecretString);
	} catch (error) {
		console.error('Error fetching secret, fallback to env vars:', error.message);
		return null;
	}
}

app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		service: 'backend-test',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
		region: process.env.AWS_REGION || 'eu-west-1',
		table_name: tableName,
		secrets_enabled: !!process.env.SECRET_NAME,
	});
});

app.get('/api/todos', async (req, res) => {
	try {
		const params = {
			TableName: tableName,
		};

		const result = await dynamodb.scan(params).promise();

		res.json({
			success: true,
			data: result.Items || [],
			count: result.Count || 0,
		});
	} catch (error) {
		console.error('Error fetching todos:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch todos',
			message: error.message,
		});
	}
});

app.post('/api/todos', async (req, res) => {
	try {
		const { text, priority = 'medium' } = req.body;

		if (!text || text.trim() === '') {
			return res.status(400).json({
				success: false,
				error: 'Text is required',
			});
		}

		const todo = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			text: text.trim(),
			completed: false,
			priority: priority,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const params = {
			TableName: tableName,
			Item: todo,
			ConditionExpression: 'attribute_not_exists(id)',
		};

		await dynamodb.put(params).promise();

		res.status(201).json({
			success: true,
			data: todo,
		});
	} catch (error) {
		console.error('Error creating todo:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to create todo',
			message: error.message,
		});
	}
});

app.put('/api/todos/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { text, completed, priority } = req.body;

		const updateExpression = [];
		const expressionAttributeValues = {};
		const expressionAttributeNames = {};

		if (text !== undefined) {
			updateExpression.push('#text = :text');
			expressionAttributeNames['#text'] = 'text';
			expressionAttributeValues[':text'] = text.trim();
		}

		if (completed !== undefined) {
			updateExpression.push('completed = :completed');
			expressionAttributeValues[':completed'] = completed;
		}

		if (priority !== undefined) {
			updateExpression.push('priority = :priority');
			expressionAttributeValues[':priority'] = priority;
		}

		updateExpression.push('updatedAt = :updatedAt');
		expressionAttributeValues[':updatedAt'] = new Date().toISOString();

		const params = {
			TableName: tableName,
			Key: { id },
			UpdateExpression: `SET ${updateExpression.join(', ')}`,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames:
				Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
			ReturnValues: 'ALL_NEW',
			ConditionExpression: 'attribute_exists(id)',
		};

		const result = await dynamodb.update(params).promise();

		res.json({
			success: true,
			data: result.Attributes,
		});
	} catch (error) {
		console.error('Error updating todo:', error);
		if (error.code === 'ConditionalCheckFailedException') {
			res.status(404).json({
				success: false,
				error: 'Todo not found',
			});
		} else {
			res.status(500).json({
				success: false,
				error: 'Failed to update todo',
				message: error.message,
			});
		}
	}
});

app.delete('/api/todos/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const params = {
			TableName: tableName,
			Key: { id },
			ConditionExpression: 'attribute_exists(id)',
			ReturnValues: 'ALL_OLD',
		};

		const result = await dynamodb.delete(params).promise();

		res.json({
			success: true,
			data: result.Attributes,
		});
	} catch (error) {
		console.error('Error deleting todo:', error);
		if (error.code === 'ConditionalCheckFailedException') {
			res.status(404).json({
				success: false,
				error: 'Todo not found',
			});
		} else {
			res.status(500).json({
				success: false,
				error: 'Failed to delete todo',
				message: error.message,
			});
		}
	}
});

app.get('/api/metrics', (req, res) => {
	res.json({
		uptime_seconds: process.uptime(),
		memory_usage: process.memoryUsage(),
		environment: process.env.NODE_ENV || 'development',
		version: '1.0.0',
		timestamp: new Date().toISOString(),
	});
});

app.use((error, req, res, next) => {
	console.error('Unhandled error:', error);
	res.status(500).json({
		success: false,
		error: 'Internal server error',
		message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
	});
});

app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		error: 'Route not found',
		path: req.originalUrl,
	});
});

app.listen(port, '0.0.0.0', () => {
	console.log(`Backend server running on port ${port}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`AWS Region: ${process.env.AWS_REGION || 'eu-west-1'}`);
	console.log(`DynamoDB Table: ${tableName}`);
	console.log(`Health check: http://localhost:${port}/api/health`);
});
