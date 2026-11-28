import mongoose from 'mongoose';
import { User } from './User.js';

// Mongoose Persistent Schema for MongoDB Atlas
const VideoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  uploaderId: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  mimeType: { type: String, default: 'video/mp4' },
  views: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const MongoVideo = mongoose.models.Video || mongoose.model('Video', VideoSchema);

// Initial video collection - set to empty array so no fake videos are seeded
const initialVideos = [];

const TEASER_COVERS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80"
];

class VideoModel {
  constructor() {
    this.videos = [...initialVideos];
  }

  // Create and persist a new video entry
  async create({ title, description, videoUrl, uploaderId, thumbnail, fileSize, mimeType }) {
    const newVideo = {
      id: `video-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      description: (description || "").trim(),
      videoUrl: videoUrl.trim(),
      uploaderId: uploaderId,
      createdAt: new Date().toISOString(),
      thumbnail: (thumbnail && !thumbnail.match(/\.(mp4|mov|webm|mkv|m4v)($|\?)/i) && thumbnail !== '/FhNtifmVQAEZDgwy.jpg')
        ? thumbnail
        : TEASER_COVERS[Math.floor(Math.random() * TEASER_COVERS.length)],
      fileSize: fileSize || 0,
      mimeType: mimeType || "video/mp4",
      views: 0
    };

    this.videos.unshift(newVideo);

    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoVideo.create(newVideo);
      } catch (err) {
        console.warn('[MongoVideo create Warning]:', err.message);
      }
    }

    return this.enrichWithUploader(newVideo);
  }

  // Find all videos with enriched uploader metadata
  async findAll() {
    let videos = this.videos;
    if (mongoose.connection.readyState >= 1) {
      try {
        const docs = await MongoVideo.find().sort({ createdAt: -1 }).lean();
        if (docs && docs.length > 0) {
          const merged = [...docs];
          for (const mv of this.videos) {
            if (!merged.some(v => v.id === mv.id)) {
              merged.push(mv);
            }
          }
          videos = merged;
        }
      } catch (err) {
        console.warn('[MongoVideo findAll Warning]:', err.message);
      }
    }
    return videos.map(v => this.enrichWithUploader(v));
  }

  // Find single video by ID
  async findById(id) {
    let video = this.videos.find(v => v.id === id);
    if (!video && mongoose.connection.readyState >= 1) {
      try {
        video = await MongoVideo.findOne({ id }).lean();
        if (video) this.videos.push(video);
      } catch (err) {
        console.warn('[MongoVideo findById Warning]:', err.message);
      }
    }
    if (!video) return null;
    return this.enrichWithUploader(video);
  }

  // Find videos by uploaderId
  async findByUploader(uploaderId) {
    const all = await this.findAll();
    return all.filter(v => v.uploaderId === uploaderId);
  }

  // Delete a video (only owner or admin)
  async delete(id, uploaderId) {
    const index = this.videos.findIndex(v => v.id === id && v.uploaderId === uploaderId);
    let deleted = null;
    if (index !== -1) {
      [deleted] = this.videos.splice(index, 1);
    }
    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoVideo.deleteOne({ id, uploaderId });
      } catch (err) {
        console.warn('[MongoVideo delete Warning]:', err.message);
      }
    }
    return deleted;
  }

  // Attach uploader profile info (name, username, avatar, verified, category)
  enrichWithUploader(video) {
    const uploader = User.findByIdSync ? User.findByIdSync(video.uploaderId) : User.users.find(u => u.id === video.uploaderId);
    return {
      ...video,
      uploader: uploader ? {
        id: uploader.id,
        name: uploader.name,
        username: uploader.username,
        avatar: uploader.avatar,
        verified: Boolean(uploader.verified),
        category: uploader.category || "Creator"
      } : null
    };
  }
}

export const Video = new VideoModel();
