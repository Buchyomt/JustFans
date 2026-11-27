import app from '../server/src/index.js';
import { connectDB } from '../server/src/config/db.js';
import mongoose from 'mongoose';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  if (mongoose.connection.readyState < 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[Vercel DB Connection Error]:', err);
    }
  }
  return app(req, res);
}

