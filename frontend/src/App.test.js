import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('axios', () => ({
	get: jest.fn(() =>
		Promise.resolve({
			data: {
				success: true,
				data: [],
				count: 0,
			},
		}),
	),
	post: jest.fn(() =>
		Promise.resolve({
			data: {
				success: true,
				data: {
					id: '1',
					text: 'Test todo',
					completed: false,
					priority: 'medium',
				},
			},
		}),
	),
	put: jest.fn(() =>
		Promise.resolve({
			data: { success: true },
		}),
	),
	delete: jest.fn(() =>
		Promise.resolve({
			data: { success: true },
		}),
	),
}));

const mockHealthResponse = {
	data: {
		status: 'OK',
		service: 'backend-test',
		timestamp: new Date().toISOString(),
		environment: 'test',
	},
};

const mockMetricsResponse = {
	data: {
		uptime_seconds: 3600,
		memory_usage: { heapUsed: 15000000 },
		environment: 'test',
		version: '1.0.0',
	},
};

const axios = require('axios');

describe('App Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();

		axios.get.mockImplementation((url) => {
			if (url.includes('/health')) {
				return Promise.resolve(mockHealthResponse);
			}
			if (url.includes('/metrics')) {
				return Promise.resolve(mockMetricsResponse);
			}
			if (url.includes('/todos')) {
				return Promise.resolve({
					data: {
						success: true,
						data: [],
						count: 0,
					},
				});
			}
			return Promise.resolve({ data: {} });
		});
	});

	test('renders main application title', () => {
		render(<App />);
		expect(screen.getByText(/IIM Todo App/i)).toBeInTheDocument();
	});

	test('renders add todo section', () => {
		render(<App />);
		expect(screen.getByText(/Ajouter une nouvelle tâche/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/Entrez votre tâche/i)).toBeInTheDocument();
	});

	test('shows health status when loaded', async () => {
		render(<App />);

		await waitFor(() => {
			expect(screen.getByText(/Backend connecté/i)).toBeInTheDocument();
		});
	});

	test('can type in todo input field', () => {
		render(<App />);

		const input = screen.getByPlaceholderText(/Entrez votre tâche/i);
		fireEvent.change(input, { target: { value: 'Test todo input' } });

		expect(input.value).toBe('Test todo input');
	});

	test('has add todo button', () => {
		render(<App />);

		const addButton = screen.getByRole('button', { name: /Ajouter/i });
		expect(addButton).toBeInTheDocument();
	});

	test('shows statistics section', () => {
		render(<App />);

		expect(screen.getByText(/Statistiques/i)).toBeInTheDocument();
	});

	test('displays todo list section', async () => {
		render(<App />);

		await waitFor(() => {
			expect(screen.getByText(/Mes tâches/i)).toBeInTheDocument();
		});
	});

	test('handles API error gracefully', async () => {
		axios.get.mockRejectedValueOnce(new Error('Network error'));

		render(<App />);

		await waitFor(() => {
			expect(screen.getByText(/IIM Todo App/i)).toBeInTheDocument();
		});
	});
});
