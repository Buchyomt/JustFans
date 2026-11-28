import mongoose from 'mongoose';
import { mockPosts } from '../data/mockData.js';

const PostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  creatorId: { type: String, required: true },
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  mediaType: { type: String, default: 'video' },
  mediaUrl: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  isLocked: { type: Boolean, default: false },
  requiredTier: { type: String, default: 'free' },
  priceToUnlock: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  tipsTotal: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  comments: { type: [Object], default: [] },
  unlockedUsers: { type: [String], default: [] },
  likedUsers: { type: [String], default: [] },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const MongoPost = mongoose.models.Post || mongoose.model('Post', PostSchema);

export class PostModel {
  constructor() {
    this.posts = mockPosts;
  }

  async getAll() {
    if (mongoose.connection.readyState >= 1) {
      try {
        const docs = await MongoPost.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          const merged = [...docs];
          for (const mp of this.posts) {
            if (!merged.some(p => p.id === mp.id)) {
              merged.push(mp);
            }
          }
          return merged;
        }
      } catch (err) {
        console.warn('[MongoPost getAll Warning]:', err.message);
      }
    }
    return this.posts;
  }

  async create(postData) {
    this.posts.unshift(postData);
    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoPost.create(postData);
      } catch (err) {
        console.warn('[MongoPost create Warning]:', err.message);
      }
    }
    return postData;
  }

  async delete(id) {
    this.posts = this.posts.filter(p => p.id !== id);
    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoPost.deleteOne({ id });
      } catch (err) {
        console.warn('[MongoPost delete Warning]:', err.message);
      }
    }
    return true;
  }
}

export const Post = new PostModel();
