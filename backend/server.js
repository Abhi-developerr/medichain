require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { connectDB } = require('./config/db');
const { redisClient, cache } = require('./config/redis');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
  }
});

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Compression middleware
app.use(compression());

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/emergency-contacts', require('./routes/emergencyContacts'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/health-metrics', require('./routes/healthMetrics'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/2fa', require('./routes/twoFactor'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/allergies', require('./routes/allergies'));
app.use('/api/family', require('./routes/family'));
app.use('/api/timeline', require('./routes/timeline'));
app.use('/api/health-goals', require('./routes/healthGoals'));
app.use('/api/lab-tests', require('./routes/labTests'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/video-consultations', require('./routes/videoConsultations'));
app.use('/api/medication-tracker', require('./routes/medicationTracker'));
app.use('/api/health-chat', require('./routes/healthChat'));
app.use('/api/document-scanner', require('./routes/documentScanner'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/wellness-programs', require('./routes/wellnessPrograms'));
app.use('/api/emergency-sos', require('./routes/emergencySOS'));
app.use('/api/telemedicine', require('./routes/telemedicine'));
app.use('/api/health-records', require('./routes/healthRecords'));
app.use('/api/symptom-checker', require('./routes/symptomChecker'));
app.use('/api/health-analytics', require('./routes/healthAnalytics'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediChain API is running',
    timestamp: new Date().toISOString()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MediChain API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      reports: '/api/reports',
      admin: '/api/admin',
      reminders: '/api/reminders'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Socket.io connection handling
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // User joins with their ID
  socket.on('user:join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    socket.join(userId); // Join room with user's ID
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`📱 User ${userId} joined`);
  });

  // Send message
  socket.on('message:send', async (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    
    // Emit to receiver if online
    if (receiverSocketId) {
      io.to(receiverId).emit('message:receive', message);
    }
    
    // Emit back to sender for confirmation
    socket.emit('message:sent', message);
  });

  // Typing indicator
  socket.on('typing:start', (receiverId) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverId).emit('typing:user', { userId: socket.userId, typing: true });
    }
  });

  socket.on('typing:stop', (receiverId) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverId).emit('typing:user', { userId: socket.userId, typing: false });
    }
  });

  // Mark message as read
  socket.on('message:read', (data) => {
    const { messageId, senderId } = data;
    const senderSocketId = onlineUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderId).emit('message:read', { messageId });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('users:online', Array.from(onlineUsers.keys()));
      console.log(`📴 User ${socket.userId} disconnected`);
    }
  });
});

// Make io accessible in routes
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     🏥 MediChain API Server Running       ║
║                                           ║
║     Port: ${PORT}                         ║
║     Environment: ${process.env.NODE_ENV || 'development'}           ║
║     URL: http://localhost:${PORT}          ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;