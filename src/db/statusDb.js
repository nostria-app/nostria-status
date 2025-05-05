import { JsonlDB } from "@alcalzone/jsonl-db";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from '../config.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DB directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database instance
const db = new JsonlDB(path.join(dbDir, 'db.jsonl'));
await db.open();

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
        
        this.db.set(id, record);
        
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
        
        for (const [_, record] of this.db.entries()) {
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
        
        for (const [_, record] of this.db.entries()) {
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
        
        for (const [_, record] of this.db.entries()) {
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
        
        const keysToDelete = [];
        
        for (const [key, record] of this.db.entries()) {
            if (new Date(record.timestamp) < cutoffDate) {
                keysToDelete.push(key);
            }
        }
        
        if (keysToDelete.length > 0) {
            for (const key of keysToDelete) {
                this.db.delete(key);
            }
            console.log(`Purged ${keysToDelete.length} records older than ${config.dataRetentionDays} days`);
        }
    }
}

// Create instance
const statusDbInstance = new StatusDb();

// Export methods individually for ESM compatibility
export const init = statusDbInstance.init.bind(statusDbInstance);
export const addRecord = statusDbInstance.addRecord.bind(statusDbInstance);
export const getServiceRecords = statusDbInstance.getServiceRecords.bind(statusDbInstance);
export const getAllRecords = statusDbInstance.getAllRecords.bind(statusDbInstance);
export const getLatestStatus = statusDbInstance.getLatestStatus.bind(statusDbInstance);
export const purgeOldRecords = statusDbInstance.purgeOldRecords.bind(statusDbInstance);