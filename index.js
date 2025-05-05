import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejsLayouts from 'express-ejs-layouts';
import config from './src/config.js';
import apiRoutes from './src/routes/api.js';
import indexRoutes from './src/routes/index.js';
import * as monitoringService from './src/services/monitoringService.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Set up view engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'src/public')));

// Routes
app.use('/api', apiRoutes);
app.use('/', indexRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Initialize monitoring service and start server
const startServer = async () => {
  try {
    // Initialize the monitoring service
    await monitoringService.init();
    
    // Start server
    const port = config.port;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Dashboard: http://localhost:${port}`);
      console.log(`API: http://localhost:${port}/api/status`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();