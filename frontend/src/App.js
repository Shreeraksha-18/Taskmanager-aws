import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// In production REACT_APP_API_URL is empty string
// so all /api/* calls go to same origin (CloudFront)
const API = process.env.REACT_APP_API_URL || '';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const completedCount = tasks.filter((t) => t.done).length;

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/tasks`);
      setTasks(res.data);
    } catch {
      setError('Could not load tasks.');
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await axios.post(`${API}/api/tasks`, { title: input });
    setInput('');
    fetchTasks();
  };

  const toggle = async (id) => {
    await axios.patch(`${API}/api/tasks/${id}`);
    fetchTasks();
  };

  const remove = async (id) => {
    await axios.delete(`${API}/api/tasks/${id}`);
    fetchTasks();
  };

  return (
    <main className="app-shell">
      <div className="app">
        <header className="app-header">
          <h1>Task Manager</h1>
          <p>{completedCount}/{tasks.length} completed</p>
        </header>

        {error && <p className="error">{error}</p>}

        <form onSubmit={addTask} className="task-form">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What needs to be done?"
          />
          <button type="submit">Add Task</button>
        </form>

        <ul className="task-list">
          {tasks.length === 0 && (
            <li className="empty-state">No tasks yet. Add your first task above.</li>
          )}
          {tasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <button
                type="button"
                className="task-title"
                onClick={() => toggle(t.id)}
                aria-label={`Toggle ${t.title}`}
              >
                {t.title}
              </button>
              <button type="button" className="delete-btn" onClick={() => remove(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}