import mongoose from 'mongoose';
import dns from 'dns';

// Ensure public DNS resolution for Atlas SRV records on local environments if needed
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore if custom DNS fails
  }
}

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('ℹ️  [Database] Running in local in-memory storage mode.');
    console.log('👉 To connect real persistent cloud MongoDB, paste your MONGODB_URI into server/.env');
    return false;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri.trim(), {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    }).catch(err => {
      cachedPromise = null;
      throw err;
    });
  }

  try {
    const conn = await cachedPromise;
    console.log(`\n=============================================================`);
    console.log(`🍃 [MongoDB Atlas] Connected Successfully!`);
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`=============================================================`);
    return true;
  } catch (err) {
    console.error(`\n❌ [MongoDB Connection Error]: ${err.message}`);
    console.log('⚠️  Falling back to local in-memory storage mode.\n');
    return false;
  }
};

