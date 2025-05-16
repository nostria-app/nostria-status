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
      name: "Nostria Metadata",
      url: "https://metadata.nostria.app/p/17e2889fba01021d048a13fd0ba108ad31c38326295460c21e69c43fa8fbe515",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Nostria Find",
      url: "https://find.nostria.app/p/npub1zl3g38a6qypp6py2z07shggg45cu8qex992xpss7d8zrl28mu52s4cjajh",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Discovery Relay (EU)",
      url: "https://discovery-eu.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Discovery Relay (AF)",
      url: "https://discovery-af.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "User Relay Ribo (EU)",
      url: "https://ribo-eu.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "User Relay Rilo (EU)",
      url: "https://rilo-eu.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "User Relay Rifu (EU)",
      url: "https://rifu-eu.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Media Server Mibo (EU)",
      url: "https://mibo-eu.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Media Server Milo (EU)",
      url: "https://milo-eu.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "User Relay Ribo (AF)",
      url: "https://ribo-af.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    {
      name: "Media Server Mibo (AF)",
      url: "https://mibo-af.nostria.app",
      method: "GET",
      expectedStatus: 200,
    },
    // {
    //   name: "Media Server Mifu (EU)",
    //   url: "https://relay-mifu-eu.nostria.app",
    //   method: "GET",
    //   expectedStatus: 200,
    // },
  ],

  // Database path - use environment variable or default to '/home/data'
  dbPath: process.env.DB_PATH || './data',

  // Check interval in milliseconds (default: 10 minute)
  checkInterval: parseInt(process.env.CHECK_INTERVAL_MS) || 10 * 60 * 1000,

  // Data retention period in days (default: 7 days)
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS) || 14,

  // Port for the web server
  port: parseInt(process.env.PORT) || 3000,
};

export default config;