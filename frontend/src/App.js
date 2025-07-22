import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
	const [todos, setTodos] = useState([]);
	const [newTodo, setNewTodo] = useState('');
	const [status, setStatus] = useState('Loading...');

	useEffect(() => {
		fetchTodos();
		checkHealth();
	}, []);

	const checkHealth = async () => {
		try {
			const response = await axios.get('/api/health');
			setStatus(`✅ Backend connecté - ${response.data.timestamp}`);
		} catch (error) {
			setStatus('❌ Backend déconnecté');
		}
	};

	const fetchTodos = async () => {
		try {
			const response = await axios.get('/api/todos');
			setTodos(response.data);
		} catch (error) {
			console.error('Erreur lors de la récupération des todos:', error);
		}
	};

	const addTodo = async () => {
		if (!newTodo.trim()) return;

		try {
			const response = await axios.post('/api/todos', { text: newTodo });
			setTodos([...todos, response.data]);
			setNewTodo('');
		} catch (error) {
			console.error("Erreur lors de l'ajout du todo:", error);
		}
	};

	return (
		<div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
			<h1>🚀 IIM Cloud DevOps - Application Test</h1>

			<div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
				<strong>Status:</strong> {status}
			</div>

			<div style={{ marginBottom: '20px' }}>
				<h2>Todo List Test (DynamoDB)</h2>
				<div style={{ marginBottom: '10px' }}>
					<input
						type='text'
						value={newTodo}
						onChange={(e) => setNewTodo(e.target.value)}
						placeholder='Ajouter une tâche de test...'
						style={{ padding: '8px', marginRight: '10px', width: '300px' }}
					/>
					<button onClick={addTodo} style={{ padding: '8px 16px' }}>
						Ajouter
					</button>
				</div>
			</div>

			<div>
				<h3>Tâches ({todos.length})</h3>
				{todos.length === 0 ? (
					<p>
						<em>Aucune tâche. Ajoutez-en une pour tester DynamoDB !</em>
					</p>
				) : (
					<ul>
						{todos.map((todo) => (
							<li key={todo.id} style={{ margin: '5px 0' }}>
								{todo.text} <small>({todo.createdAt})</small>
							</li>
						))}
					</ul>
				)}
			</div>

			<div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
				<p>✅ Infrastructure: EC2 + DynamoDB + ECR</p>
				<p>✅ Pipeline: GitHub Actions → Docker → AWS</p>
				<p>🔄 En attente: Code du professeur</p>
			</div>
		</div>
	);
}

export default App;
