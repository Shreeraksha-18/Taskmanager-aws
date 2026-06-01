const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

async function connectDB() {
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
    console.error('DB failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };