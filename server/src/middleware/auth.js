import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';

// Authentication middleware to protect designated API routes
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'justfans_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    
    // Auto-reconnect to MongoDB Atlas if serverless instance just spun up
    if (mongoose.connection.readyState < 1 && process.env.MONGODB_URI) {
      try {
        await connectDB();
      } catch (dbErr) {
        console.warn('[requireAuth DB Connect Warning]:', dbErr.message);
      }
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};

// Optional auth: populates req.user if token is valid, but allows guest access if absent
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'justfans_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    if (mongoose.connection.readyState < 1 && process.env.MONGODB_URI) {
      try {
        await connectDB();
      } catch {}
    }

    req.user = (await User.findById(decoded.id)) || null;
  } catch {
    req.user = null;
  }

  next();
};

