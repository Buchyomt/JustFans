import express from 'express';
import fs from 'fs';
import path from 'path';
import { Video } from '../models/Video.js';
import { requireAuth } from '../middleware/auth.js';
import { handleVideoUpload, UPLOAD_DIR } from '../middleware/upload.js';
import { mockPosts } from '../data/mockData.js';
import { resolveTeaserCover } from './posts.js';

const router = express.Router();

// GET /api/videos - Public endpoint to fetch all uploaded videos with uploader metadata
router.get('/', (req, res) => {
  try {
    const { uploaderId, search } = req.query;
    let videoList = Video.findAll();

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
router.get('/:id', (req, res) => {
  try {
    const video = Video.findById(req.params.id);
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

// GET /api/videos/stream/:filename - Video streaming endpoint with fallback
router.get('/stream/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // If local file was cleaned by serverless container recycling, stream high-speed 4K sample video
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
      // If a file was written to disk, clean it up before returning error
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
      // Stream URL handled by Express video streamer
      videoUrl = `/api/videos/stream/${req.file.filename}`;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
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

    // Write metadata to Video model
    const newVideo = Video.create({
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
    mockPosts.unshift(feedPost);

    // Increment creator's post counter if uploader is a creator
    if (req.user.role === 'creator') {
      req.user.postCount = (req.user.postCount || 0) + 1;
    }

    const enrichedVideo = Video.findById(newVideo.id);

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
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const video = Video.findById(req.params.id);
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

    Video.delete(req.params.id, req.user.id);

    // Also remove corresponding post from mockPosts feed
    const postIdx = mockPosts.findIndex(p => p.mediaUrl === video.videoUrl);
    if (postIdx !== -1) {
      mockPosts.splice(postIdx, 1);
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

