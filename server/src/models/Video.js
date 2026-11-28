import { User } from './User.js';

// Seed video collection
const initialVideos = [
  {
    id: "video-101",
    title: "Uncensored 4K Solo Bedroom Tape [Full Length]",
    description: "Exclusive full session for all active VIP subscribers. Uncut 4K video drop.",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    uploaderId: "creator-1",
    createdAt: "2026-11-05T08:30:00.000Z",
    fileSize: 48520300,
    mimeType: "video/mp4",
    views: 3420
  },
  {
    id: "video-102",
    title: "EXCLUSIVE: Secret Midnight Session 💦",
    description: "Special uncut 4K video session for VIP fans. Turn your volume up!",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    thumbnail: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
    uploaderId: "creator-1",
    createdAt: "2026-11-04T16:00:00.000Z",
    fileSize: 84320000,
    mimeType: "video/mp4",
    views: 8940
  },
  {
    id: "video-103",
    title: "Maya Lin Private TS Tape & Toy Play 🏳️‍⚧️💋",
    description: "Full private session with interactive toy play and morning shower teaser.",
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
    uploaderId: "creator-4",
    createdAt: "2026-11-03T20:15:00.000Z",
    fileSize: 112450000,
    mimeType: "video/mp4",
    views: 2150
  }
];

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
  create({ title, description, videoUrl, uploaderId, thumbnail, fileSize, mimeType }) {
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
    return newVideo;
  }

  // Find all videos with enriched uploader metadata
  findAll() {
    return this.videos.map(v => this.enrichWithUploader(v));
  }

  // Find single video by ID
  findById(id) {
    const video = this.videos.find(v => v.id === id);
    if (!video) return null;
    return this.enrichWithUploader(video);
  }

  // Find videos by uploaderId
  findByUploader(uploaderId) {
    return this.videos
      .filter(v => v.uploaderId === uploaderId)
      .map(v => this.enrichWithUploader(v));
  }

  // Delete a video (only owner or admin)
  delete(id, uploaderId) {
    const index = this.videos.findIndex(v => v.id === id && v.uploaderId === uploaderId);
    if (index === -1) return null;
    const [deleted] = this.videos.splice(index, 1);
    return deleted;
  }

  // Attach uploader profile info (name, username, avatar, verified, category)
  enrichWithUploader(video) {
    const uploader = User.findById(video.uploaderId);
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

