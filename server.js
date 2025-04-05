const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const app = express();
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure port for Express server
const PORT = process.env.PORT || 3000;
const FLASK_PORT = process.env.FLASK_PORT || 5001;

// Start Flask API server
console.log('Starting Flask API server...');
const flaskProcess = spawn('python3', [path.join(__dirname, 'api/run.py')], {
  stdio: 'inherit',
  env: { ...process.env, FLASK_PORT }
});

flaskProcess.on('error', (err) => {
  console.error('Failed to start Flask API server:', err);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  flaskProcess.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  flaskProcess.kill();
  process.exit();
});