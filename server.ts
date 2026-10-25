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
// Connects to Production MongoDB Store when available and seeds canonical fixtures.
// Seamlessly provides zero-downtime canonical in-memory fallback when offline.
import { initMongoDatabase } from './src/backend/persistence/mongoInit.ts';
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
const companion = createCompanionApp();
app.use(companion.app);

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
