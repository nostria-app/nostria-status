import express from 'express';
import * as monitoringService from '../services/monitoringService.js';
import config from '../config.js';

const router = express.Router();

/**
 * Serve the main dashboard page
 */
router.get('/', async (req, res) => {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 7;
        
        // Get latest status and uptime data
        const latestStatus = await monitoringService.getLatestStatus();
        const uptimeData = await monitoringService.calculateAllUptime(days);
        
        // Render the dashboard
        res.render('dashboard', {
            title: 'Service Status',
            services: config.services,
            status: latestStatus,
            uptime: uptimeData,
            days
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to load dashboard',
            error
        });
    }
});

/**
 * Serve the service detail page
 */
router.get('/service/:name', async (req, res) => {
    try {
        const serviceName = req.params.name;
        const days = req.query.days ? parseInt(req.query.days) : 7;
        
        // Find the service in the config
        const serviceConfig = config.services.find(s => s.name === serviceName);
        if (!serviceConfig) {
            return res.status(404).render('error', { 
                title: 'Not Found',
                message: `Service '${serviceName}' not found`,
                error: { status: 404 }
            });
        }
        
        // Get service history and uptime
        const history = await monitoringService.getServiceHistory(serviceName, days);
        const uptime = await monitoringService.calculateUptime(serviceName, days);
        
        // Render the service detail page
        res.render('service', {
            title: `${serviceName} Status`,
            service: serviceConfig,
            history,
            uptime,
            days
        });
    } catch (error) {
        console.error('Error rendering service page:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to load service details',
            error
        });
    }
});

export default router;