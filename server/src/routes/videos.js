import express from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Video } from '../models/Video.js';
import { Post } from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';
import { handleVideoUpload, UPLOAD_DIR } from '../middleware/upload.js';
import { mockPosts } from '../data/mockData.js';
import { resolveTeaserCover } from './posts.js';

const router = express.Router();

// Helper to get raw MongoDB database instance (compatible with Mongoose 8 and Serverless)
export const getMongoDB = () => {
  if (mongoose.connection.readyState >= 1) {
    if (mongoose.connection.db) return mongoose.connection.db;
    if (mongoose.connection.client) return mongoose.connection.client.db(mongoose.connection.name || 'justfans');
  }
  return null;
};

// Helper to access MongoDB GridFS bucket
export const getGridBucket = () => {
  const db = getMongoDB();
  if (db) {
    try {
      return new mongoose.mongo.GridFSBucket(db, { bucketName: 'videos' });
    } catch (e) {
      console.warn('[GridFSBucket init error]:', e.message);
      return null;
    }
  }
  return null;
};

// GET /api/videos - Public endpoint to fetch all uploaded videos with uploader metadata
router.get('/', async (req, res) => {
  try {
    const { uploaderId, search } = req.query;
    let videoList = await Video.findAll();

    if (uploaderId) {
      videoList = videoList.filter(v => v.uploaderId === uploaderId);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      videoList = videoList.filter(v => 
        v.title.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.uploader && (v.uploader.name.toLowerCase().includes(q) || v.uploader.username.toLowerCase().includes(q)))
      );
    }

    return res.json({
      success: true,
      count: videoList.length,
      videos: videoList
    });
  } catch (err) {
    console.error('[Get Videos Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve video catalog.'
    });
  }
});

// GET /api/videos/:id - Public endpoint to fetch a single video by ID
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.'
      });
    }

    // Increment view counter
    video.views = (video.views || 0) + 1;

    return res.json({
      success: true,
      video
    });
  } catch (err) {
    console.error('[Get Video By ID Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load video details.'
    });
  }
});

// GET /api/videos/stream/:filename - Video streaming endpoint with MongoDB GridFS and range support
router.get('/stream/:filename', async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, filename);

  // 1. If file exists on local temporary disk
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // 2. Stream directly from MongoDB Atlas GridFS
  const db = getMongoDB();
  const bucket = getGridBucket();
  if (db && bucket) {
    try {
      const cleanName = filename.replace(/\.(mp4|mov|webm|mkv|m4v)$/i, '');
      const files = await db.collection('videos.files').find({
        $or: [
          { filename },
          { filename: `${cleanName}.mp4` },
          { filename: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }
        ]
      }).toArray();

      if (files && files.length > 0) {
        const fileDoc = files[0];
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileDoc.length - 1;
          const chunksize = (end - start) + 1;

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileDoc.length}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': fileDoc.contentType || 'video/mp4',
          });

          const downloadStream = bucket.openDownloadStreamByName(fileDoc.filename, { start, end: end + 1 });
          return downloadStream.pipe(res);
        } else {
          res.writeHead(200, {
            'Content-Length': fileDoc.length,
            'Content-Type': fileDoc.contentType || 'video/mp4',
            'Accept-Ranges': 'bytes'
          });
          const downloadStream = bucket.openDownloadStreamByName(fileDoc.filename);
          return downloadStream.pipe(res);
        }
      }
    } catch (gridErr) {
      console.warn('[GridFS Stream Warning]:', gridErr.message);
    }
  }

  // 3. Fallback to resilient CDN stream if file was deleted
  return res.redirect(302, 'https://vjs.zencdn.net/v/oceans.mp4');
});

// POST /api/videos/upload-file - Direct video file uploader for editing/replacing post media
router.post('/upload-file', requireAuth, handleVideoUpload('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video file provided.' });
  }
  const videoUrl = `/api/videos/stream/${req.file.filename}`;
  return res.json({
    success: true,
    videoUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

// POST /api/videos - Protected endpoint to upload video file and save metadata
router.post('/', requireAuth, handleVideoUpload('video'), async (req, res) => {
  try {
    const { title, description, isLocked, priceToUnlock, thumbnail } = req.body;
    const uploaderId = req.user.id;

    // Validate title
    if (!title || !title.trim()) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Video title is required.'
      });
    }

    // Check if video file was uploaded or videoUrl provided
    let videoUrl = '';
    let fileSize = 0;
    let mimeType = 'video/mp4';

    if (req.file) {
      videoUrl = `/api/videos/stream/${req.file.filename}`;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;

      // Pipe to MongoDB Atlas GridFS for persistent cross-container streaming
      if (mongoose.connection.readyState >= 1) {
        try {
          const bucket = getGridBucket();
          if (bucket) {
            const uploadStream = bucket.openUploadStream(req.file.filename, {
              contentType: req.file.mimetype
            });
            fs.createReadStream(req.file.path).pipe(uploadStream);
          }
        } catch (gridErr) {
          console.warn('[GridFS Upload Warning]:', gridErr.message);
        }
      }
    } else if (req.body.videoUrl && req.body.videoUrl.trim()) {
      videoUrl = req.body.videoUrl.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please select a video file to upload (field name: "video") or provide a videoUrl.'
      });
    }

    // Resolve a unique eye-catching teaser cover if none provided
    const resolvedThumb = resolveTeaserCover(thumbnail, videoUrl, `vid-${Date.now()}`);

    // Write metadata to Video model (MongoDB Atlas + memory)
    const newVideo = await Video.create({
      title,
      description,
      videoUrl,
      uploaderId,
      thumbnail: resolvedThumb,
      fileSize,
      mimeType
    });

    // Also sync to platform feed posts so it shows in the channel
    const feedPost = {
      id: `post-vid-${Date.now()}`,
      creatorId: uploaderId,
      title: newVideo.title,
      caption: newVideo.description || "",
      mediaType: "video",
      mediaUrl: videoUrl,
      thumbnail: resolvedThumb,
      isLocked: isLocked === 'true' || isLocked === true,
      requiredTier: (isLocked === 'true' || isLocked === true) ? "Standard Fan" : "free",
      priceToUnlock: Number(priceToUnlock) || 0,
      likes: 0,
      commentsCount: 0,
      tipsTotal: 0,
      createdAt: newVideo.createdAt,
      tags: ["UploadedVideo", "4K"],
      comments: [],
      unlockedUsers: []
    };
    await Post.create(feedPost);

    // Increment creator's post counter if uploader is a creator
    if (req.user.role === 'creator') {
      req.user.postCount = (req.user.postCount || 0) + 1;
    }

    const enrichedVideo = await Video.findById(newVideo.id);

    return res.status(201).json({
      success: true,
      message: 'Video uploaded and published successfully!',
      video: enrichedVideo,
      post: feedPost
    });
  } catch (err) {
    console.error('[Upload Video Error]:', err);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to process and store video.'
    });
  }
});

// DELETE /api/videos/:id - Protected endpoint to delete a video and unlink file
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    // Check ownership
    if (video.uploaderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own videos.' });
    }

    // If local file, delete from disk
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/videos/')) {
      const filename = path.basename(video.videoUrl);
      const filePath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    await Video.delete(req.params.id, req.user.id);

    // Also remove corresponding post from feed
    const allPosts = await Post.getAll();
    const post = allPosts.find(p => p.mediaUrl === video.videoUrl);
    if (post) {
      await Post.delete(post.id);
      if (req.user.postCount > 0) {
        req.user.postCount -= 1;
      }
    }

    return res.json({
      success: true,
      message: 'Video deleted successfully.'
    });
  } catch (err) {
    console.error('[Delete Video Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete video.' });
  }
});

export default router;

