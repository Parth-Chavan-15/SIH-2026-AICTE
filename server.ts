import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

// Security & Middleware
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Database & Companion Layer Selection
// Default to authoritative in-memory Companion Layer with Canonical Fixtures (AY 2026-27).
// Gracefully falls back if external MongoDB is offline or unconfigured.
import apiRouter from './src/backend/routes/index.js';
import { createCompanionApp } from './src/backend/companionApp.ts';

let mongoConnected = false;
if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      autoCreate: false,
      autoIndex: false,
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
    });
    mongoConnected = mongoose.connection.readyState === 1;
    if (mongoConnected) {
      console.log('📦 Connected to MongoDB backend store.');
    }
  } catch {
    console.log('ℹ️ External MongoDB not reachable. Running in Canonical In-Memory Companion Mode.');
    mongoConnected = false;
  }
}

// Attach io instance to request
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

if (mongoConnected) {
  app.use('/api/v1', apiRouter);
} else {
  console.log('🏛️ Initializing AICTE PravahReg Companion Runtime with Canonical Fixtures (2026-27)...');
  const companion = createCompanionApp();
  app.use(companion.app);
}

// Realtime is closed until authenticated, scoped subscriptions have a reviewed adapter.
io.use((_socket, next) => next(new Error('Realtime subscriptions unavailable')));
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Vite Middleware for Frontend in Development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  const status = err.type === 'entity.too.large' ? 413 : err.status === 400 ? 422 : 503;
  const code = status === 413 ? 'FILE_TOO_LARGE' : status === 422 ? 'VALIDATION_FAILED' : 'STORAGE_UNAVAILABLE';
  res.status(status).json({ success: false, error: { code, message: 'Request could not be processed' } });
});

httpServer.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`🚀 AICTE Backend & Dev Server running on port ${PORT}`);
});
