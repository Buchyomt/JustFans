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
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const MongoPost = mongoose.models.Post || mongoose.model('Post', PostSchema);

export class PostModel {
  constructor() {
    this.posts = [...mockPosts];
  }

  async getAll() {
    if (mongoose.connection.readyState >= 1) {
      try {
        const docs = await MongoPost.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          // Normalize documents to ensure all fields are properly structured
          const normalizedDocs = docs.map(d => ({
            ...d,
            title: d.title || d.caption || 'Untitled Post',
            caption: d.caption || '',
            mediaUrl: d.mediaUrl || '',
            thumbnail: d.thumbnail || '',
            isLocked: Boolean(d.isLocked),
            priceToUnlock: Number(d.priceToUnlock) || 0
          }));

          // Keep in-memory cache synchronized with MongoDB Atlas
          this.posts = normalizedDocs;
          return normalizedDocs;
        }
      } catch (err) {
        console.warn('[MongoPost getAll Warning]:', err.message);
      }
    }
    return this.posts;
  }

  async findById(id) {
    if (!id) return null;
    let post = this.posts.find(p => p.id === id);
    if (!post && mongoose.connection.readyState >= 1) {
      try {
        post = await MongoPost.findOne({ id }).lean();
        if (post) {
          this.posts.push(post);
        }
      } catch (err) {
        console.warn('[MongoPost findById Warning]:', err.message);
      }
    }
    return post || null;
  }

  async create(postData) {
    const newPost = {
      ...postData,
      createdAt: postData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.posts.unshift(newPost);
    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoPost.create(newPost);
      } catch (err) {
        console.warn('[MongoPost create Warning]:', err.message);
      }
    }
    return newPost;
  }

  async update(id, updates) {
    const updatedAt = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt };

    const idx = this.posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.posts[idx] = { ...this.posts[idx], ...cleanUpdates };
    }

    let updatedDoc = null;
    if (mongoose.connection.readyState >= 1) {
      try {
        updatedDoc = await MongoPost.findOneAndUpdate(
          { id },
          { $set: cleanUpdates },
          { new: true }
        ).lean();
      } catch (err) {
        console.warn('[MongoPost update Warning]:', err.message);
      }
    }

    return updatedDoc || this.posts.find(p => p.id === id) || cleanUpdates;
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
