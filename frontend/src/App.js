import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

function App() {
	const [todos, setTodos] = useState([]);
	const [newTodo, setNewTodo] = useState('');
	const [newPriority, setNewPriority] = useState('medium');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [healthStatus, setHealthStatus] = useState(null);
	const [metrics, setMetrics] = useState(null);
	const [editingTodo, setEditingTodo] = useState(null);

	useEffect(() => {
		fetchTodos();
		checkHealth();
		fetchMetrics();
	}, []);

	const checkHealth = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/health`);
			setHealthStatus(response.data);
		} catch (error) {
			console.error('Health check failed:', error);
			setHealthStatus({ status: 'ERROR', message: 'Backend unreachable' });
		}
	};

	const fetchMetrics = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/metrics`);
			setMetrics(response.data);
		} catch (error) {
			console.error('Failed to fetch metrics:', error);
		}
	};

	const fetchTodos = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${API_BASE_URL}/todos`);
			if (response.data.success) {
				setTodos(response.data.data);
				setError('');
			} else {
				setError('Failed to fetch todos');
			}
		} catch (error) {
			console.error('Error fetching todos:', error);
			setError('Error connecting to backend');
		} finally {
			setLoading(false);
		}
	};

	const addTodo = async (e) => {
		e.preventDefault();
		if (!newTodo.trim()) return;

		setLoading(true);
		try {
			const response = await axios.post(`${API_BASE_URL}/todos`, {
				text: newTodo.trim(),
				priority: newPriority,
			});

			if (response.data.success) {
				setTodos([...todos, response.data.data]);
				setNewTodo('');
				setNewPriority('medium');
				setError('');
			} else {
				setError('Failed to add todo');
			}
		} catch (error) {
			console.error('Error adding todo:', error);
			setError(error.response?.data?.message || 'Error adding todo');
		} finally {
			setLoading(false);
		}
	};

	const updateTodo = async (id, updates) => {
		setLoading(true);
		try {
			const response = await axios.put(`${API_BASE_URL}/todos/${id}`, updates);

			if (response.data.success) {
				setTodos(todos.map((todo) => (todo.id === id ? response.data.data : todo)));
				setEditingTodo(null);
				setError('');
			} else {
				setError('Failed to update todo');
			}
		} catch (error) {
			console.error('Error updating todo:', error);
			setError(error.response?.data?.message || 'Error updating todo');
		} finally {
			setLoading(false);
		}
	};

	const deleteTodo = async (id) => {
		if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
			return;
		}

		setLoading(true);
		try {
			const response = await axios.delete(`${API_BASE_URL}/todos/${id}`);

			if (response.data.success) {
				setTodos(todos.filter((todo) => todo.id !== id));
				setError('');
			} else {
				setError('Failed to delete todo');
			}
		} catch (error) {
			console.error('Error deleting todo:', error);
			setError(error.response?.data?.message || 'Error deleting todo');
		} finally {
			setLoading(false);
		}
	};

	const toggleComplete = async (id, completed) => {
		await updateTodo(id, { completed: !completed });
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'high':
				return '#ff4757';
			case 'medium':
				return '#ffa502';
			case 'low':
				return '#2ed573';
			default:
				return '#747d8c';
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString('fr-FR');
	};

	return (
		<div className='app'>
			<header className='app-header'>
				<h1>🚀 IIM Todo App - Cloud DevOps</h1>

				<div className={`health-status ${healthStatus?.status === 'OK' ? 'healthy' : 'unhealthy'}`}>
					{healthStatus?.status === 'OK' ? (
						<span>✅ Backend connecté - {healthStatus.environment}</span>
					) : (
						<span>❌ Backend déconnecté</span>
					)}
				</div>
			</header>

			<main className='main-content'>
				<section className='add-todo-section'>
					<h2>Ajouter une nouvelle tâche</h2>
					<form onSubmit={addTodo} className='add-todo-form'>
						<input
							type='text'
							value={newTodo}
							onChange={(e) => setNewTodo(e.target.value)}
							placeholder='Entrez votre tâche...'
							className='todo-input'
							disabled={loading}
						/>
						<select
							value={newPriority}
							onChange={(e) => setNewPriority(e.target.value)}
							className='priority-select'
							disabled={loading}
						>
							<option value='low'>🟢 Basse</option>
							<option value='medium'>🟡 Moyenne</option>
							<option value='high'>🔴 Haute</option>
						</select>
						<button type='submit' disabled={loading || !newTodo.trim()}>
							{loading ? '⏳' : '➕'} Ajouter
						</button>
					</form>
				</section>

				{error && (
					<div className='error-message'>
						❌ {error}
						<button onClick={() => setError('')} className='close-error'>
							✖
						</button>
					</div>
				)}

				<section className='todos-section'>
					<div className='todos-header'>
						<h2>Mes tâches ({todos.length})</h2>
						<button onClick={fetchTodos} disabled={loading} className='refresh-btn'>
							{loading ? '⏳' : '🔄'} Actualiser
						</button>
					</div>

					{loading && todos.length === 0 ? (
						<div className='loading'>⏳ Chargement des tâches...</div>
					) : todos.length === 0 ? (
						<div className='no-todos'>📝 Aucune tâche. Ajoutez-en une pour commencer !</div>
					) : (
						<div className='todos-grid'>
							{todos.map((todo) => (
								<div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
									{editingTodo === todo.id ? (
										<EditTodoForm
											todo={todo}
											onSave={(updates) => updateTodo(todo.id, updates)}
											onCancel={() => setEditingTodo(null)}
											loading={loading}
										/>
									) : (
										<TodoCard
											todo={todo}
											onToggleComplete={() => toggleComplete(todo.id, todo.completed)}
											onEdit={() => setEditingTodo(todo.id)}
											onDelete={() => deleteTodo(todo.id)}
											getPriorityColor={getPriorityColor}
											formatDate={formatDate}
											loading={loading}
										/>
									)}
								</div>
							))}
						</div>
					)}
				</section>

				<section className='stats-section'>
					<h3>📊 Statistiques</h3>
					<div className='stats-grid'>
						<div className='stat-card'>
							<span className='stat-number'>{todos.length}</span>
							<span className='stat-label'>Total</span>
						</div>
						<div className='stat-card'>
							<span className='stat-number'>{todos.filter((t) => t.completed).length}</span>
							<span className='stat-label'>Terminées</span>
						</div>
						<div className='stat-card'>
							<span className='stat-number'>{todos.filter((t) => !t.completed).length}</span>
							<span className='stat-label'>En cours</span>
						</div>
						<div className='stat-card'>
							<span className='stat-number'>
								{todos.filter((t) => t.priority === 'high').length}
							</span>
							<span className='stat-label'>Priorité haute</span>
						</div>
					</div>
				</section>

				<section className='system-info'>
					<details>
						<summary>🛠️ Informations système</summary>
						<div className='info-grid'>
							{healthStatus && (
								<div className='info-card'>
									<h4>Backend Status</h4>
									<pre>{JSON.stringify(healthStatus, null, 2)}</pre>
								</div>
							)}
							{metrics && (
								<div className='info-card'>
									<h4>Métriques</h4>
									<pre>{JSON.stringify(metrics, null, 2)}</pre>
								</div>
							)}
						</div>
					</details>
				</section>
			</main>

			<footer className='app-footer'>
				<p>🎓 Projet IIM Cloud DevOps | 🚀 Déployé sur AWS</p>
				<div className='tech-stack'>
					<span>React</span> • <span>Node.js</span> • <span>DynamoDB</span> •<span>Docker</span> •{' '}
					<span>Terraform</span> • <span>GitHub Actions</span>
				</div>
			</footer>
		</div>
	);
}

function TodoCard({
	todo,
	onToggleComplete,
	onEdit,
	onDelete,
	getPriorityColor,
	formatDate,
	loading,
}) {
	return (
		<>
			<div className='todo-header'>
				<span
					className='priority-badge'
					style={{ backgroundColor: getPriorityColor(todo.priority) }}
				>
					{todo.priority}
				</span>
				<span className='todo-date'>{formatDate(todo.createdAt)}</span>
			</div>

			<div className='todo-content'>
				<p className={`todo-text ${todo.completed ? 'completed-text' : ''}`}>{todo.text}</p>
			</div>

			<div className='todo-actions'>
				<button
					onClick={onToggleComplete}
					className={`toggle-btn ${todo.completed ? 'completed' : ''}`}
					disabled={loading}
				>
					{todo.completed ? '✅' : '⭕'}
				</button>
				<button onClick={onEdit} disabled={loading} className='edit-btn'>
					✏️
				</button>
				<button onClick={onDelete} disabled={loading} className='delete-btn'>
					🗑️
				</button>
			</div>
		</>
	);
}

function EditTodoForm({ todo, onSave, onCancel, loading }) {
	const [text, setText] = useState(todo.text);
	const [priority, setPriority] = useState(todo.priority);

	const handleSave = (e) => {
		e.preventDefault();
		if (text.trim()) {
			onSave({ text: text.trim(), priority });
		}
	};

	return (
		<form onSubmit={handleSave} className='edit-form'>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				className='edit-textarea'
				disabled={loading}
			/>
			<select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={loading}>
				<option value='low'>🟢 Basse</option>
				<option value='medium'>🟡 Moyenne</option>
				<option value='high'>🔴 Haute</option>
			</select>
			<div className='edit-actions'>
				<button type='submit' disabled={loading}>
					{loading ? '⏳' : '💾'} Sauver
				</button>
				<button type='button' onClick={onCancel} disabled={loading}>
					❌ Annuler
				</button>
			</div>
		</form>
	);
}

export default App;
