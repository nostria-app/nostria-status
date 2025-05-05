const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const config = require('./src/config');
const apiRoutes = require('./src/routes/api');
const indexRoutes = require('./src/routes/index');
const monitoringService = require('./src/services/monitoringService');

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