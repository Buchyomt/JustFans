import mongoose from 'mongoose';

// Schema for individual chat messages in MongoDB Atlas
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  threadId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  text: { type: String, default: '' },
  tip: { type: Number, default: 0 },
  isLockedPPV: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  unlocked: { type: Boolean, default: false },
  attachmentUrl: { type: String, default: '' },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// Schema for conversation threads in MongoDB Atlas
const ThreadSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  participantA: { type: String, required: true, index: true },
  participantB: { type: String, required: true, index: true },
  creatorId: { type: String, required: true },
  fanId: { type: String, required: true },
  lastMessage: { type: String, default: '' },
  lastTimestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const MongoMessage = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const MongoThread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);

// Deterministic conversation ID based on two user IDs (never duplicates or mixes)
export const getDeterministicThreadId = (userA, userB) => {
  const sorted = [String(userA).trim(), String(userB).trim()].sort();
  return `thread_${sorted[0]}_${sorted[1]}`;
};
