import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import creatorsRoutes from './routes/creators.js';
import postsRoutes from './routes/posts.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import messagesRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import videosRoutes from './routes/videos.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded video & image files from /uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'JustFans Server',
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

// 404 Route handler
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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 JustFans Server running smoothly on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎬 Video Uploads served at: http://localhost:${PORT}/uploads/videos/`);
});
