const { JsonlDB } = require('@alcalzone/jsonl-db');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure DB directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database instance
const db = new JsonlDB(path.join(dbDir, 'status.jsonl'));

/**
 * Status Database Service
 */
class StatusDb {
    constructor() {
        this.db = db;
        
        // Auto-purge old records every day
        setInterval(() => this.purgeOldRecords(), 24 * 60 * 60 * 1000);
    }

    /**
     * Initialize the database
     */
    async init() {
        console.log('Status database initialized');
        
        // Initial purge of old records
        await this.purgeOldRecords();
        
        return this;
    }

    /**
     * Add a status check record to the database
     * @param {Object} record - Status check record
     */
    async addRecord(record) {
        const timestamp = new Date().toISOString();
        const id = `${record.service}_${timestamp}`;
        
        this.db.add({
            ...record,
            id,
            timestamp
        });
        
        return id;
    }

    /**
     * Get status records for a service
     * @param {string} serviceName - Service name
     * @param {number} days - Number of days to look back
     * @returns {Array} - Array of status records
     */
    async getServiceRecords(serviceName, days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const records = [];
        const allRecords = this.db.read();
        
        for (const record of allRecords) {
            if (record.service === serviceName && 
                new Date(record.timestamp) >= cutoffDate) {
                records.push(record);
            }
        }
        
        // Sort by timestamp, newest first
        return records.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    /**
     * Get all status records grouped by service
     * @returns {Object} - Records grouped by service
     */
    async getAllRecords(days = 7) {
        const services = {};
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const allRecords = this.db.read();
        
        for (const record of allRecords) {
            if (new Date(record.timestamp) >= cutoffDate) {
                if (!services[record.service]) {
                    services[record.service] = [];
                }
                services[record.service].push(record);
            }
        }
        
        // Sort each service's records by timestamp
        for (const service in services) {
            services[service].sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        }
        
        return services;
    }
    
    /**
     * Get latest status for each service
     * @returns {Object} - Latest status for each service
     */
    async getLatestStatus() {
        const services = {};
        const allRecords = this.db.read();
        
        for (const record of allRecords) {
            const serviceName = record.service;
            
            if (!services[serviceName] || 
                new Date(record.timestamp) > new Date(services[serviceName].timestamp)) {
                services[serviceName] = record;
            }
        }
        
        return services;
    }
    
    /**
     * Purge records older than the retention period
     */
    async purgeOldRecords() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - config.dataRetentionDays);
        
        let purgingNeeded = false;
        const newRecords = [];
        const allRecords = this.db.read();
        
        for (const record of allRecords) {
            if (new Date(record.timestamp) >= cutoffDate) {
                newRecords.push(record);
            } else {
                purgingNeeded = true;
            }
        }
        
        if (purgingNeeded) {
            // Clear the database and add back only the records we want to keep
            this.db.clear();
            for (const record of newRecords) {
                this.db.add(record);
            }
            console.log(`Purged records older than ${config.dataRetentionDays} days`);
        }
    }
}

module.exports = new StatusDb();