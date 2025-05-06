/**
 * Configuration file for Nostria Status Monitoring App
 * Add services to be monitored in the services array
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Services to monitor
  services: [
    {
      name: "Nostria App",
      url: "https://nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Nostria Website",
      url: "https://www.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Discovery Relay",
      url: "https://discovery.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Nostria Metadata",
      url: "https://metadata.nostria.app/p/17e2889fba01021d048a13fd0ba108ad31c38326295460c21e69c43fa8fbe515",
      method: "GET",
      expectedStatus: 200,
    },
  ],
  
  // Database path - use environment variable or default to '/home/data'
  dbPath: process.env.DB_PATH || '/home/data',

  // Check interval in milliseconds (default: 10 minute)
  checkInterval: parseInt(process.env.CHECK_INTERVAL_MS) || 10 * 60 * 1000,

  // Data retention period in days (default: 7 days)
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS) || 7,

  // Port for the web server
  port: parseInt(process.env.PORT) || 3000,
};

export default config;