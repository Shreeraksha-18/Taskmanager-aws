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
    <div className="app">
      <h1>Task Manager</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={addTask}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="New task..."
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map(t => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <span onClick={() => toggle(t.id)}>{t.title}</span>
            <button onClick={() => remove(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}