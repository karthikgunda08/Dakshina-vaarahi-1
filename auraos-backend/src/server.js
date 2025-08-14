// src/server.js
import 'dotenv/config'; // Load environment variables from .env file
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// --- Improved Environment Variable Check ---
const criticalEnvVars = [ 'MONGODB_URI', 'GEMINI_API_KEY', 'JWT_SECRET', 'CLIENT_URL' ];
const paymentEnvVars = [ 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET' ];
const emailServiceVars = [ 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM' ];

const missingCriticalVars = criticalEnvVars.filter(varName => !process.env[varName]);
const missingPaymentVars = paymentEnvVars.filter(varName => !process.env[varName]);
const missingEmailVars = emailServiceVars.filter(varName => !process.env[varName]);

if (missingCriticalVars.length > 0) {
  console.error("\n❌ CRITICAL ERROR: Your backend server cannot start.");
  console.error("The following required environment variables are missing from your `.env` file:");
  missingCriticalVars.forEach(varName => console.error(`   - ${varName}`));
  console.error("\n👉 Please create or complete the `.env` file in the `auraos-backend/` directory.");
  console.error("Refer to `auraos-backend/README.md` for detailed instructions.\n");
  process.exit(1); // Exit the process with an error code
}

if (missingPaymentVars.length > 0) {
    console.warn("\n⚠️ WARNING: Payment gateway environment variables are missing.");
    console.warn("The following optional variables are missing from your `.env` file:");
    missingPaymentVars.forEach(varName => console.warn(`   - ${varName}`));
    console.warn("\nThe server will start, but payment features (buying credits) will be disabled.\n");
}

if (missingEmailVars.length > 0) {
    console.warn("\n⚠️ WARNING: Production email service is not configured.");
    console.warn("The following environment variables are missing from your `.env` file:");
    missingEmailVars.forEach(varName => console.warn(`   - ${varName}`));
    console.warn("\nThe server will start, but features like password resets and collaboration invites will only be logged to the console and not sent as real emails. This is not suitable for a production environment.");
    console.warn("Refer to the main `README.md` for setup instructions.\n");
}
// --- End Check ---

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import geminiProxyRoutes from './routes/geminiProxyRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import foundationRoutes from './routes/foundationRoutes.js'; 
import walletRoutes from './routes/walletRoutes.js';
import astraRoutes from './routes/astraRoutes.js';
import AppError from './utils/AppError.js';
import initializeSocketHandlers from './socket/socketHandlers.js';

const app = express();
const httpServer = createServer(app); // Create HTTP server for Socket.IO
const isProduction = process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200
};

// --- Socket.IO Integration ---
const io = new Server(httpServer, {
  cors: corsOptions
});

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.user = decoded; // Attach user data to the socket
        next();
    });
});

initializeSocketHandlers(io);
// --- End Socket.IO Integration ---

// --- Security Middleware ---
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [ "'self'", "https://checkout.razorpay.com" ],
    workerSrc: ["'self'", "blob:"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.razorpay.com", "https:"],
    frameSrc: ["'self'", "https://api.razorpay.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));
if (isProduction) { app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })); }
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false, message: 'Too many requests' });
app.use('/api', limiter);

// --- General Middleware & DB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });
app.use(cors(corsOptions));
app.use('/api/payments/verify-credit-payment', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/gemini', geminiProxyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/foundation', foundationRoutes); 
app.use('/api/wallet', walletRoutes);
app.use('/api/astra', astraRoutes);
app.get('/', (req, res) => res.send('AuraOS Backend is running!'));

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (isProduction && !err.isOperational) {
    console.error('PROGRAMMING_ERROR: ', err);
    return res.status(500).json({ status: 'error', message: 'Something went very wrong!' });
  }
  if (!isProduction) console.error('DEV_ERROR_HANDLER:', err.stack || err);
  res.status(err.statusCode).json({ status: err.status, message: err.message });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3001;
const server = httpServer.listen(PORT, () => {
  console.log(`🚀 AuraOS Backend launched successfully on port ${PORT}`);
  console.log(`🔗 Accepting requests from frontend at: ${process.env.CLIENT_URL}`);
});

// --- Graceful Shutdown ---
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  io.close();
  server.close(async () => {
    console.log('HTTP server closed.');
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection at:', promise, 'reason:', reason));
process.on('uncaughtException', (error) => { console.error('Uncaught Exception:', error); gracefulShutdown('uncaughtException').then(() => process.exit(1)); });
