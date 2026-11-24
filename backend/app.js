const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./src/routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorMiddleware');

dotenv.config();

const app = express();

// Enable CORS for all origins in development or configured frontend URL
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Development Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[HTTP ${req.method}] ${req.url}`);
    next();
  });
}

// API Health Check & Root Info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Roxiler Store Rating Platform API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Mount Central API Routes
app.use('/api', routes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
