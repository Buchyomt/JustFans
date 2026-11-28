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

export const DEFAULT_MONGODB_URI = 'mongodb+srv://buchychristen_db_user:BuchyOMT@cluster0.iz04nvq.mongodb.net/justfans?retryWrites=true&w=majority';

let cachedPromise = null;

// Seed initial data into Atlas if collections are newly created and empty
export const seedInitialData = async () => {
  try {
    const { MongoUser } = await import('../models/User.js');
    const { MongoPost } = await import('../models/Post.js');
    const { MongoThread, MongoMessage } = await import('../models/Message.js');
    const { mockUsers, mockPosts } = await import('../data/mockData.js');

    const userCount = await MongoUser.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding default users...');
      await MongoUser.insertMany(mockUsers);
    }

    const postCount = await MongoPost.countDocuments();
    if (postCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding default posts...');
      await MongoPost.insertMany(mockPosts);
    }

    const threadCount = await MongoThread.countDocuments();
    if (threadCount === 0) {
      console.log('🌱 [MongoDB Atlas] Seeding initial VIP thread...');
      const initThread = {
        id: 'thread_creator-1_user-fan-1',
        participantA: 'creator-1',
        participantB: 'user-fan-1',
        creatorId: 'creator-1',
        fanId: 'user-fan-1',
        lastMessage: "Hey babe! 💕 Welcome to my exclusive VIP chat.",
        lastTimestamp: new Date().toISOString()
      };
      await MongoThread.create(initThread);
      await MongoMessage.create({
        id: `m-init-${Date.now()}`,
        threadId: initThread.id,
        senderId: 'creator-1',
        text: "Hey babe! 💕 Welcome to my exclusive VIP chat. If you're looking to subscribe ($60/mo) and unlock my full uncut 4K video vault, message me right here to get my approved CashApp, Gift Cards, or Crypto details! 😈",
        timestamp: new Date().toISOString()
      });
    }
  } catch (seedErr) {
    console.warn('⚠️ [MongoDB Atlas Seed Warning]:', seedErr.message);
  }
};

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  const uri = (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) || DEFAULT_MONGODB_URI;

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri.trim(), {
      bufferCommands: true,
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

    // Ensure collections and seed data exist
    await seedInitialData();

    return true;
  } catch (err) {
    console.error(`\n❌ [MongoDB Connection Error]: ${err.message}`);
    console.log('⚠️  Falling back to local in-memory storage mode.\n');
    return false;
  }
};
