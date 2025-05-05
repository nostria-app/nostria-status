import fetch from 'node-fetch';
import config from '../config.js';
import * as statusDb from '../db/statusDb.js';

/**
 * Monitoring Service
 * Handles the health checks for configured services
 */
class MonitoringService {
    constructor() {
        this.checkInterval = null;
    }

    /**
     * Initialize the monitoring service
     */
    async init() {
        // Initialize the database
        await statusDb.init();
        
        // Start the health check interval
        this.startMonitoring();
        
        return this;
    }

    /**
     * Start the monitoring service
     */
    startMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        // Perform an initial check immediately
        this.checkAllServices();
        
        // Set up the interval for regular checks
        this.checkInterval = setInterval(() => {
            this.checkAllServices();
        }, config.checkInterval);
        
        console.log(`Monitoring started, checking ${config.services.length} services every ${config.checkInterval / 1000} seconds`);
    }

    /**
     * Stop the monitoring service
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('Monitoring stopped');
        }
    }

    /**
     * Check all configured services
     */
    async checkAllServices() {
        for (const service of config.services) {
            try {
                await this.checkService(service);
            } catch (error) {
                console.error(`Error checking service ${service.name}:`, error);
            }
        }
    }

    /**
     * Check a single service
     * @param {Object} service - Service configuration
     */
    async checkService(service) {
        const startTime = Date.now();
        let responseTime = 0;
        let status = 'error';
        let statusCode = 0;
        let message = '';
        
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, 10000); // 10 second timeout
            
            const response = await fetch(service.url, {
                method: service.method || 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            responseTime = Date.now() - startTime;
            statusCode = response.status;
            
            // Check if response status matches the expected status
            if (response.status === (service.expectedStatus || 200)) {
                status = 'online';
                message = 'Service is online';
            } else {
                status = 'error';
                message = `Service returned unexpected status code: ${response.status}`;
            }
        } catch (error) {
            responseTime = Date.now() - startTime;
            status = 'offline';
            message = error.name === 'AbortError' 
                ? 'Service timed out' 
                : `Error: ${error.message}`;
        }
        
        // Create record
        const record = {
            service: service.name,
            url: service.url,
            status,
            statusCode,
            responseTime,
            message
        };
        
        // Store in database
        await statusDb.addRecord(record);
        
        console.log(`Checked ${service.name}: ${status} (${responseTime}ms)`);
        
        return record;
    }

    /**
     * Get latest status for all services
     * @returns {Object} - Latest status for each service
     */
    async getLatestStatus() {
        return await statusDb.getLatestStatus();
    }

    /**
     * Get status records for a service
     * @param {string} serviceName - Service name
     * @param {number} days - Number of days to look back
     * @returns {Array} - Array of status records
     */
    async getServiceHistory(serviceName, days = 7) {
        return await statusDb.getServiceRecords(serviceName, days);
    }

    /**
     * Get all status records grouped by service
     * @returns {Object} - Records grouped by service
     */
    async getAllHistory(days = 7) {
        return await statusDb.getAllRecords(days);
    }

    /**
     * Calculate uptime percentage for a service
     * @param {string} serviceName - Service name
     * @param {number} days - Number of days to calculate for
     * @returns {number} - Uptime percentage
     */
    async calculateUptime(serviceName, days = 7) {
        const records = await statusDb.getServiceRecords(serviceName, days);
        
        if (records.length === 0) return 0;
        
        const onlineCount = records.filter(r => r.status === 'online').length;
        return (onlineCount / records.length) * 100;
    }

    /**
     * Calculate uptime for all services
     * @param {number} days - Number of days to calculate for
     * @returns {Object} - Uptime by service
     */
    async calculateAllUptime(days = 7) {
        const services = {};
        
        for (const service of config.services) {
            services[service.name] = {
                uptime: await this.calculateUptime(service.name, days),
                config: service
            };
        }
        
        return services;
    }
}

// Create instance and export its methods
const monitoringService = new MonitoringService();

// Export all methods individually for ESM compatibility
export const init = monitoringService.init.bind(monitoringService);
export const startMonitoring = monitoringService.startMonitoring.bind(monitoringService);
export const stopMonitoring = monitoringService.stopMonitoring.bind(monitoringService);
export const checkAllServices = monitoringService.checkAllServices.bind(monitoringService);
export const checkService = monitoringService.checkService.bind(monitoringService);
export const getLatestStatus = monitoringService.getLatestStatus.bind(monitoringService);
export const getServiceHistory = monitoringService.getServiceHistory.bind(monitoringService);
export const getAllHistory = monitoringService.getAllHistory.bind(monitoringService);
export const calculateUptime = monitoringService.calculateUptime.bind(monitoringService);
export const calculateAllUptime = monitoringService.calculateAllUptime.bind(monitoringService);