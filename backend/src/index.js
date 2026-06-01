const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const { connectDB } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// ALB / CloudFront health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/tasks', taskRoutes);

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`API running on port ${PORT}`)
  );
});