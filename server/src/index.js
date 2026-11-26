import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import creatorsRoutes from './routes/creators.js';
import postsRoutes from './routes/posts.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import messagesRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import videosRoutes from './routes/videos.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both server/.env and root/.env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Increase payload limit to 100MB for 4K video thumbnails & multipart metadata
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static uploaded video & image files from /uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Also serve public client assets (e.g. FhNtifmVQAEZDgwy.jpg) if fetched from server port
app.use(express.static(path.join(__dirname, '../../client/public')));

// Serve production built client if present
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// API Health Check
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    app: 'JustFans Server',
    database: isMongoConnected 
      ? `MongoDB Atlas Connected (${mongoose.connection.name})` 
      : 'In-Memory / File-Storage',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/videos', videosRoutes);

// SPA Client Routing fallback (serves index.html for browser routes if client is built)
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Route handler for API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[JustFans Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server after connecting to Database
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 JustFans Server running smoothly on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎬 Video Uploads served at: http://localhost:${PORT}/uploads/videos/`);
    console.log(`=============================================================\n`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app, startServer };
