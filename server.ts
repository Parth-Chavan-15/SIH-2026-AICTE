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

const allowedOrigin = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;

// Security & Middleware
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // High ceiling for high-concurrency evaluation and demonstration
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/v1/auth/') || req.path === '/api/v1/ready' || req.path === '/health' || req.path === '/api/version' || req.path === '/version' || req.path === '/api/v1/version',
});
app.use('/api/', limiter);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Database & Companion Layer Selection
// Connects to Production MongoDB Store when available and seeds canonical fixtures.
// Seamlessly provides zero-downtime canonical in-memory fallback when offline.
import { initMongoDatabase } from './src/backend/persistence/mongoInit.ts';
import { createMongoStorage } from './src/backend/persistence/mongoCore.ts';
import { createCompanionApp } from './src/backend/companionApp.ts';

const mongoInit = await initMongoDatabase(process.env.MONGODB_URI);

if (mongoInit.connected) {
  console.log(`🍃 Connected to Production MongoDB Database [${mongoInit.dbName}].`);
  if (mongoInit.collectionsSeeded && mongoInit.collectionsSeeded > 0) {
    console.log(`📦 Seeded ${mongoInit.collectionsSeeded} Canonical College Cases into MongoDB.`);
  } else {
    console.log('📦 Verified existing MongoDB collections and indexes.');
  }
} else {
  console.log(`ℹ️ External MongoDB not active (${mongoInit.reason || 'unreachable'}). Running with Zero-Downtime Canonical Storage Engine.`);
}

// Attach io instance to request
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

console.log('🏛️ Initializing AICTE NiyamSetu (नियमसेतु) Companion Runtime (AY 2026–27)...');

let companionStorage: any = undefined;
if (mongoInit.connected) {
  const baseStorage = createMongoStorage();
  companionStorage = Object.assign(baseStorage, {
    inspect: () => ({
      mode: 'database',
      dbName: mongoInit.dbName,
      connected: true,
      collectionsSeeded: mongoInit.collectionsSeeded,
    }),
    reset: async () => {
      await initMongoDatabase(process.env.MONGODB_URI);
    },
  });
  console.log('🔗 Companion Application wired directly to MongoDB Storage Adapter.');
} else {
  console.log('🛡️ Companion Application running with Zero-Downtime Canonical Memory Storage.');
}

const companion = createCompanionApp(companionStorage ? { storage: companionStorage } : undefined);
app.use(companion.app);

// Top-Level Diagnostic & Version Endpoints
app.get('/version', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.5.0',
    service: 'niyamsetu-aicte',
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'bc341e6',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
app.get('/api/version', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.5.0',
    service: 'niyamsetu-aicte',
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'bc341e6',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});


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

const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

httpServer.listen(Number(PORT), HOST, () => {
  console.log(`🚀 AICTE NiyamSetu Server running on http://${HOST}:${PORT}`);
});
