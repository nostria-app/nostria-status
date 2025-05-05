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
      name: "Google",
      url: "https://www.google.com",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Example API",
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "GET",
      expectedStatus: 200,
    },
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
      url: "https://metadata.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    // Add more services as needed
  ],
  
  // Check interval in milliseconds (default: 1 minute)
  checkInterval: parseInt(process.env.CHECK_INTERVAL_MS) || 60 * 1000,
  
  // Data retention period in days (default: 7 days)
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS) || 7,
  
  // Port for the web server
  port: parseInt(process.env.PORT) || 3000,
};

export default config;