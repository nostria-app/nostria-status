const express = require('express');
const path = require('path');
const cron = require('node-cron');
const fetch = require('node-fetch'); // Use require for node-fetch v2 if installed, or adjust for v3+ import
const { JsonlDB, Database } = require('@alcalzone/jsonl-db');
const config = require('./config.json');

const app = express();
const port = process.env.PORT || 3000;

// Ensure db directory exists (optional, jsonl-db might handle it)
const fs = require('fs');
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// Database setup
// Define the type of data we're going to store
/**
 * @typedef {object} HealthCheckRecord
 * @property {string} url The monitored URL
 * @property {number} timestamp Unix timestamp (ms) of the check
 * @property {'online' | 'offline'} status Status of the service
 * @property {number | null} responseTime Response time in ms, or null if offline
 * @property {number | string | null} statusCode HTTP status code, or error code/message
 */

/** @type {Database<HealthCheckRecord>} */
const db = new JsonlDB(path.join(dbDir, 'healthchecks.jsonl'));

// Function to perform health check
async function checkUrl(url) {
    const startTime = Date.now();
    let status = 'offline';
    let responseTime = null;
    let statusCode = null;

    try {
        const response = await fetch(url, { timeout: 10000 }); // 10 second timeout
        responseTime = Date.now() - startTime;
        statusCode = response.status;
        if (response.ok) {
            status = 'online';
        } else {
            status = 'offline'; // Consider non-2xx status codes as offline for simplicity
        }
    } catch (error) {
        responseTime = Date.now() - startTime; // Record time even on error
        status = 'offline';
        statusCode = error.code || error.message; // e.g., ENOTFOUND, ETIMEDOUT
        console.error(`Error checking ${url}: ${error.message}`);
    }

    const record = {
        url,
        timestamp: startTime, // Use start time for consistency
        status,
        responseTime,
        statusCode
    };

    // Store in DB
    await db.set(record); // Correct method to add/update
    console.log(`Checked ${url}: ${status} (${statusCode}), ${responseTime}ms`);
}

// Schedule health checks (every minute)
cron.schedule('*/1 * * * *', async () => {
    console.log('Running scheduled health checks...');
    await db.open(); // Ensure DB is open before operations
    for (const url of config.urls) {
        await checkUrl(url);
    }
    await db.close(); // Close after batch operations
    console.log('Finished scheduled health checks.');
});

// Schedule cleanup task (daily at midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup task...');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    await db.open();
    try {
        // Find records older than one week
        const oldRecords = await db.query(record => record.timestamp < oneWeekAgo);
        if (oldRecords.length > 0) {
            // Remove them by their internal ID (_id)
            const idsToRemove = oldRecords.map(r => r._id);
            await db.deleteMany(idsToRemove);
            console.log(`Cleaned up ${idsToRemove.length} old records.`);
        } else {
            console.log('No old records to clean up.');
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await db.close();
    }
});

// --- Express Routes ---

// Serve static files (CSS, frontend JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML page
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API endpoint for status
app.get('/api/status', async (req, res) => {
    await db.open();
    const statusData = {};
    const historyLimit = 50; // Number of history entries per URL

    try {
        for (const url of config.urls) {
            // Get the most recent check for the current status
            const latestCheck = await db.queryOne(
                record => record.url === url,
                { sortBy: 'timestamp', sortOrder: 'desc' }
            );

            // Get recent history
            const history = await db.query(
                record => record.url === url,
                { sortBy: 'timestamp', sortOrder: 'desc', limit: historyLimit }
            );

            statusData[url] = {
                currentStatus: latestCheck ? latestCheck.status : 'unknown',
                lastCheckTimestamp: latestCheck ? latestCheck.timestamp : null,
                responseTime: latestCheck ? latestCheck.responseTime : null,
                statusCode: latestCheck ? latestCheck.statusCode : null,
                history: history.reverse() // Reverse to show oldest first
            };
        }
        res.json(statusData);
    } catch (error) {
        console.error("Error fetching status data:", error);
        res.status(500).json({ error: "Failed to retrieve status data" });
    } finally {
        await db.close();
    }
});

// Start the server
app.listen(port, async () => {
    console.log(`Status dashboard listening on port ${port}`);
    // Perform initial checks on startup
    console.log('Performing initial health checks...');
    await db.open();
    for (const url of config.urls) {
        await checkUrl(url);
    }
    await db.close();
    console.log('Initial health checks complete.');
});
