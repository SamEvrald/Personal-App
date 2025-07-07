const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const dailyRoutes = require('./routes/daily');
const weeklyRoutes = require('./routes/weekly');
const jobRoutes = require('./routes/jobs');

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend dev server
  'http://localhost:5173', // Common Vite dev server port
  'http://localhost:8081',
  'https://personal-app-fronten.vercel.app', // <-- REMOVED TRAILING SLASH HERE. REPLACE WITH YOUR ACTUAL VERCEL URL
  // Add any other domains your frontend might be hosted on
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in our allowed list.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Deny access if the origin is not allowed
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      callback(new Error(msg), false);
    }
  },
  credentials: true, // Allow cookies/authorization headers to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
  optionsSuccessStatus: 200 // For preflight requests
};

// CORS configuration - ONLY ONE INSTANCE HERE
app.use(cors(corsOptions)); // <-- THIS IS THE ONLY CORS MIDDLEWARE WE NEED

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// The duplicate CORS configuration has been removed from here.
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/weekly', weeklyRoutes);
app.use('/api/jobs', jobRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
