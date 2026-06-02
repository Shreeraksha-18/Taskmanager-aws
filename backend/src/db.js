const { Pool } = require('pg');

let useInMemoryStore = false;
let memoryTasks = [];
let memoryId = 1;

const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

const pool = missingVars.length ? null : new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

function getInMemoryStore() {
  return {
    async getAllTasks() {
      return [...memoryTasks].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    },
    async addTask(title) {
      const task = {
        id: memoryId++,
        title,
        done: false,
        created_at: new Date().toISOString(),
      };
      memoryTasks.push(task);
      return task;
    },
    async toggleTask(id) {
      const target = memoryTasks.find((task) => task.id === Number(id));
      if (!target) return null;
      target.done = !target.done;
      return target;
    },
    async deleteTask(id) {
      const before = memoryTasks.length;
      memoryTasks = memoryTasks.filter((task) => task.id !== Number(id));
      return memoryTasks.length !== before;
    },
  };
}

function getPostgresStore() {
  return {
    async getAllTasks() {
      const r = await pool.query(
        'SELECT * FROM tasks ORDER BY created_at DESC'
      );
      return r.rows;
    },
    async addTask(title) {
      const r = await pool.query(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
        [title]
      );
      return r.rows[0];
    },
    async toggleTask(id) {
      const r = await pool.query(
        'UPDATE tasks SET done = NOT done WHERE id=$1 RETURNING *',
        [id]
      );
      return r.rows[0] || null;
    },
    async deleteTask(id) {
      await pool.query('DELETE FROM tasks WHERE id=$1', [id]);
      return true;
    },
  };
}

async function connectDB() {
  if (missingVars.length) {
    useInMemoryStore = true;
    console.warn(
      `Missing DB environment variables (${missingVars.join(', ')}). Using in-memory task store.`
    );
    return;
  }

  try {
    await pool.query('SELECT 1');
    console.log('DB connected');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id         SERIAL PRIMARY KEY,
        title      VARCHAR(255) NOT NULL,
        done       BOOLEAN      DEFAULT FALSE,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      )
    `);
    console.log('Schema ready');
  } catch (err) {
    useInMemoryStore = true;
    console.warn(`DB unavailable (${err.message}). Using in-memory task store.`);
  }
}

function getTaskStore() {
  return useInMemoryStore ? getInMemoryStore() : getPostgresStore();
}

module.exports = { connectDB, getTaskStore };