# Nostria Status

A beautiful and modern status monitoring application that tracks and displays the health of your services.

![Nostria Status Dashboard](https://via.placeholder.com/800x400?text=Nostria+Status+Dashboard)

## Features

- 📊 Beautiful web dashboard for monitoring service status
- 🔄 Regular health checks of configured URLs
- 📝 Historical data storage using jsonl-db
- 📈 Uptime statistics and trends
- 🔌 Simple REST API
- 🧹 Automatic data cleanup (configurable retention period)
- 🐳 Docker support for easy deployment

## Quick Start

### Using Docker

```bash
# Clone the repository
git clone https://github.com/nostria-app/nostria-status.git
cd nostria-status

# Build and run with Docker
docker build -t nostria-status .
docker run -p 3000:3000 -v $(pwd)/data:/usr/src/app/src/db/data nostria-status
```

Then access the dashboard at http://localhost:3000

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/nostria-app/nostria-status.git
cd nostria-status

# Install dependencies
npm install

# Start the server
npm start
```

## Configuration

Edit `src/config.js` to configure services to monitor and other settings:

```javascript
module.exports = {
  // Services to monitor
  services: [
    {
      name: "Service Name",
      url: "https://service-url.com/health",
      method: "GET",  // HTTP method to use
      expectedStatus: 200  // Expected HTTP status
    },
    // Add more services...
  ],
  
  // Database path - use environment variable or default to '/home/data'
  dbPath: './data',
  
  // Check interval in milliseconds (default: 10 minute)
  checkInterval: 10 * 60 * 1000,
  
  // Data retention period in days (default: 7 days)
  dataRetentionDays: 7,
  
  // Port for the web server
  port: process.env.PORT || 3000,
};
```

## API Endpoints

The application provides the following API endpoints:

- `GET /api/status` - Get the current status of all services
- `GET /api/history` - Get status history for all services
- `GET /api/history/:service` - Get status history for a specific service
- `GET /api/uptime` - Get uptime statistics for all services
- `POST /api/check` - Manually trigger a health check for all services

Query parameters:
- `days` - Number of days to include in history/uptime (default: 7)

## Data Storage

Status data is stored using [@alcalzone/jsonl-db](https://github.com/AlCalzone/jsonl-db), which stores data in a JSON Lines format. The database files are located in `src/db/data/`.

By default, data older than 7 days is automatically purged. This can be configured in `src/config.js`.

## Docker Deployment

The included Dockerfile provides a production-ready container:

```bash
docker build -t nostria-status .
docker run -p 3000:3000 -v /path/to/data:/usr/src/app/src/db/data nostria-status
```

Use the `-v` flag to persist data outside the container.

## GitHub Actions CI/CD

This project includes a GitHub Actions workflow that automatically builds and publishes a Docker image to GitHub Container Registry (ghcr.io) when changes are pushed to the main branch.

To use this image:

```bash
docker pull ghcr.io/nostria-app/nostria-status:latest
docker run -p 3000:3000 ghcr.io/nostria-app/nostria-status:latest
```

## License

MIT
