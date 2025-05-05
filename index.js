// index.js - Main server entry point
const express = require('express');
const path = require('path');
const fs = require('fs');
const { JsonlDB } = require('@alcalzone/jsonl-db');
const axios = require('axios');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const DB_PATH = path.join(__dirname, 'db', 'healthchecks.jsonl');
const HISTORY_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

// Ensure db directory exists
fs.mkdirSync(path.join(__dirname, 'db'), { recursive: true });

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const db = new JsonlDB(DB_PATH, { autosave: true });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get status
app.get('/api/status', (req, res) => {
  const now = Date.now();
  const data = db.entries.filter(entry => now - entry.timestamp <= HISTORY_RETENTION_MS);
  res.json(data);
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check logic
async function performHealthChecks() {
  const now = Date.now();
  for (const service of config.services) {
    try {
      const response = await axios.get(service.url, { timeout: 10000 });
      db.push({
        timestamp: now,
        name: service.name,
        url: service.url,
        status: response.status === 200 ? 'online' : 'offline'
      });
    } catch (e) {
      db.push({
        timestamp: now,
        name: service.name,
        url: service.url,
        status: 'offline'
      });
    }
  }
  // Purge old entries
  db.entries = db.entries.filter(entry => now - entry.timestamp <= HISTORY_RETENTION_MS);
  db.save();
}

setInterval(performHealthChecks, CHECK_INTERVAL_MS);
performHealthChecks(); // Initial run

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Status dashboard running at http://localhost:${PORT}`);
});