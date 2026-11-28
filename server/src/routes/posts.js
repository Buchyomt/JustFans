import express from 'express';
import fs from 'fs';
import path from 'path';
import { mockPosts, mockUsers } from '../data/mockData.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { UPLOAD_DIR } from '../middleware/upload.js';
import { Video } from '../models/Video.js';
import { Post, MongoPost } from '../models/Post.js';
import { saveBase64Image } from '../utils/imageSaver.js';

const router = express.Router();

export const DEFAULT_TEASER_COVERS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80"
];

export const resolveTeaserCover = (thumb, mediaUrl, seed) => {
  const isVideo = (url) => url && /\.(mp4|mov|webm|mkv|m4v)($|\?)/i.test(url);
  if (thumb) {
    if (thumb.startsWith('data:image/')) {
      return saveBase64Image(thumb, 'thumb');
    }
    if (!isVideo(thumb) && thumb !== '/FhNtifmVQAEZDgwy.jpg') {
      return thumb;
    }
  }
  if (mediaUrl && !isVideo(mediaUrl) && mediaUrl !== '/FhNtifmVQAEZDgwy.jpg') {
    return mediaUrl;
  }
  const hash = (seed || Date.now().toString()).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DEFAULT_TEASER_COVERS[Math.abs(hash) % DEFAULT_TEASER_COVERS.length];
};

// Helper to enrich post with creator details & viewer access
const enrichPost = (post, currentUser) => {
  const creator = mockUsers.find(u => u.id === post.creatorId);
  const isSubscribed = currentUser?.subscriptions?.some(s => s.creatorId === post.creatorId);
  const isCreatorSelf = currentUser?.id === post.creatorId;
  const isPurchased = currentUser ? post.unlockedUsers?.includes(currentUser.id) : false;
  const isBookmarked = currentUser?.bookmarks?.includes(post.id);
  const isLiked = currentUser ? (post.likedUsers?.includes(currentUser.id) || false) : false;

  // Content is accessible if it's free, viewer is subscribed, viewer bought PPV, or viewer is author
  const hasAccess = !post.isLocked || isSubscribed || isPurchased || isCreatorSelf;

  return {
    ...post,
    hasAccess,
    isSubscribed: Boolean(isSubscribed),
    isBookmarked: Boolean(isBookmarked),
    isLiked: Boolean(isLiked),
    creator: creator ? {
      id: creator.id,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar,
      verified: creator.verified,
      category: creator.category
    } : null
  };
};

// GET /api/posts - Viewable publicly with optional personalized auth context
router.get('/', optionalAuth, async (req, res) => {
  const { filter, creatorId, mediaType } = req.query;
  const currentUser = req.user;

  let posts = await Post.getAll();

  if (creatorId) {
    posts = posts.filter(p => p.creatorId === creatorId);
  }

  if (mediaType && mediaType !== 'all') {
    posts = posts.filter(p => p.mediaType === mediaType);
  }

  if (filter === 'following' && currentUser) {
    posts = posts.filter(p => currentUser.following?.includes(p.creatorId));
  } else if (filter === 'subscribed' && currentUser) {
    const subCreatorIds = currentUser.subscriptions?.map(s => s.creatorId) || [];
    posts = posts.filter(p => subCreatorIds.includes(p.creatorId));
  } else if (filter === 'bookmarked' && currentUser) {
    posts = posts.filter(p => currentUser.bookmarks?.includes(p.id));
  }

  // Sort descending by date
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const enriched = posts.map(p => enrichPost(p, currentUser));

  res.json({
    success: true,
    count: enriched.length,
    posts: enriched
  });
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const allPosts = await Post.getAll();
  const post = allPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  res.json({
    success: true,
    post: enrichPost(post, req.user)
  });
});

// POST /api/posts - Upload/publish new post (PROTECTED by requireAuth)
router.post('/', requireAuth, async (req, res) => {
  const currentUser = req.user;
  if (currentUser.role !== 'creator') {
    return res.status(403).json({ success: false, message: "Only creators can publish posts." });
  }

  const { title, caption, mediaType, mediaUrl, thumbnail, isLocked, requiredTier, priceToUnlock, tags } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Post title is required." });
  }

  const postId = `post-${Date.now()}`;
  const resolvedCover = resolveTeaserCover(thumbnail, mediaUrl, postId);

  const newPost = {
    id: postId,
    creatorId: currentUser.id,
    title,
    caption: caption || "",
    mediaType: mediaType || "video",
    mediaUrl: mediaUrl || "https://vjs.zencdn.net/v/oceans.mp4",
    thumbnail: resolvedCover,
    isLocked: Boolean(isLocked),
    requiredTier: requiredTier || (isLocked ? "Standard Fan" : "free"),
    priceToUnlock: Number(priceToUnlock) || 0,
    likes: 0,
    commentsCount: 0,
    tipsTotal: 0,
    createdAt: new Date().toISOString(),
    tags: tags || ["Exclusive", "New"],
    comments: [],
    unlockedUsers: []
  };

  await Post.create(newPost);
  currentUser.postCount = (currentUser.postCount || 0) + 1;

  res.status(201).json({
    success: true,
    message: "Post published successfully!",
    post: enrichPost(newPost, currentUser)
  });
});

// POST /api/posts/:id/like (PROTECTED - Toggle Like / Unlike)
router.post('/:id/like', requireAuth, (req, res) => {
  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  if (!post.likedUsers) post.likedUsers = [];
  const userId = req.user.id;
  const userIndex = post.likedUsers.indexOf(userId);
  const creator = mockUsers.find(u => u.id === post.creatorId);

  let isLiked = false;
  if (userIndex > -1) {
    // Already liked -> Toggle Unlike!
    post.likedUsers.splice(userIndex, 1);
    post.likes = Math.max(0, (post.likes || 1) - 1);
    if (creator && creator.likeCount && creator.likeCount > 0) {
      creator.likeCount -= 1;
    }
    isLiked = false;
  } else {
    // Not liked yet -> Toggle Like!
    post.likedUsers.push(userId);
    post.likes = (post.likes || 0) + 1;
    if (creator) {
      creator.likeCount = (creator.likeCount || 0) + 1;
    }
    isLiked = true;
  }

  res.json({
    success: true,
    likes: post.likes,
    isLiked
  });
});

// POST /api/posts/:id/comment (PROTECTED)
router.post('/:id/comment', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "Comment text cannot be empty." });
  }

  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = req.user;
  const comment = {
    id: `c-${Date.now()}`,
    user: currentUser.username,
    userAvatar: currentUser.avatar,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  if (!post.comments) post.comments = [];
  post.comments.push(comment);
  post.commentsCount = post.comments.length;

  res.status(201).json({
    success: true,
    comment,
    commentsCount: post.commentsCount
  });
});

// POST /api/posts/:id/tip (PROTECTED)
router.post('/:id/tip', requireAuth, (req, res) => {
  const { amount } = req.body;
  const tipAmount = Number(amount);
  if (!tipAmount || tipAmount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid tip amount." });
  }

  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = req.user;
  if (currentUser.walletBalance < tipAmount) {
    return res.status(400).json({ success: false, message: "Insufficient balance in wallet." });
  }

  currentUser.walletBalance -= tipAmount;
  post.tipsTotal = (post.tipsTotal || 0) + tipAmount;

  res.json({
    success: true,
    message: `You tipped $${tipAmount.toFixed(2)} to the creator!`,
    tipsTotal: post.tipsTotal,
    newBalance: currentUser.walletBalance
  });
});

// POST /api/posts/:id/unlock (PROTECTED)
router.post('/:id/unlock', requireAuth, (req, res) => {
  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = req.user;
  const cost = post.priceToUnlock || 4.99;

  if (currentUser.walletBalance < cost) {
    return res.status(400).json({ success: false, message: "Insufficient wallet funds to unlock this post." });
  }

  currentUser.walletBalance -= cost;
  if (!post.unlockedUsers) post.unlockedUsers = [];
  if (!post.unlockedUsers.includes(currentUser.id)) {
    post.unlockedUsers.push(currentUser.id);
  }

  res.json({
    success: true,
    message: "Post unlocked successfully!",
    post: enrichPost(post, currentUser),
    newBalance: currentUser.walletBalance
  });
});

// POST /api/posts/:id/bookmark (PROTECTED)
router.post('/:id/bookmark', requireAuth, (req, res) => {
  const currentUser = req.user;
  if (!currentUser.bookmarks) currentUser.bookmarks = [];

  const postId = req.params.id;
  const idx = currentUser.bookmarks.indexOf(postId);
  let isBookmarked = false;

  if (idx > -1) {
    currentUser.bookmarks.splice(idx, 1);
    isBookmarked = false;
  } else {
    currentUser.bookmarks.push(postId);
    isBookmarked = true;
  }

  res.json({
    success: true,
    isBookmarked,
    bookmarks: currentUser.bookmarks
  });
});

// PUT /api/posts/:id (PROTECTED - Creator self or Admin edit)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const post = (await Post.findById(req.params.id)) || mockPosts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const currentUser = req.user;
    if (post.creatorId !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: "You can only edit your own posts." });
    }

    const { title, caption, mediaUrl, mediaType, thumbnail, isLocked, priceToUnlock, tags } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (caption !== undefined) updates.caption = caption.trim();
    if (mediaUrl !== undefined) updates.mediaUrl = mediaUrl.trim();
    if (mediaType !== undefined) updates.mediaType = mediaType;
    if (thumbnail !== undefined) {
      updates.thumbnail = resolveTeaserCover(thumbnail.trim(), updates.mediaUrl || post.mediaUrl, post.id);
    } else if (mediaUrl !== undefined && (!post.thumbnail || post.thumbnail === '/FhNtifmVQAEZDgwy.jpg' || /\.(mp4|mov|webm|mkv|m4v)($|\?)/i.test(post.thumbnail))) {
      updates.thumbnail = resolveTeaserCover(null, mediaUrl.trim(), post.id);
    }
    if (isLocked !== undefined) updates.isLocked = Boolean(isLocked);
    if (priceToUnlock !== undefined) updates.priceToUnlock = Number(priceToUnlock);
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [tags];

    const updatedPost = await Post.update(req.params.id, updates);

    // Also sync mockPosts in memory
    const mockIdx = mockPosts.findIndex(p => p.id === req.params.id);
    if (mockIdx !== -1) {
      mockPosts[mockIdx] = { ...mockPosts[mockIdx], ...updates };
    }

    return res.json({
      success: true,
      message: "Post updated successfully!",
      post: enrichPost(updatedPost, currentUser)
    });
  } catch (err) {
    console.error('[Edit Post Error]:', err);
    return res.status(500).json({ success: false, message: "Failed to update post." });
  }
});

// DELETE /api/posts/:id (PROTECTED - Creator self or Admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = (await Post.findById(req.params.id)) || mockPosts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const currentUser = req.user;

    // Check ownership
    if (post.creatorId !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: "You can only delete your own posts." });
    }

    // If local uploaded file, delete it from disk
    if (post.mediaUrl && post.mediaUrl.startsWith('/uploads/videos/')) {
      const filename = path.basename(post.mediaUrl);
      const filePath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    // Also remove from Video catalog if present
    const allVideos = await Video.findAll();
    const videoEntry = allVideos.find(v => v.videoUrl === post.mediaUrl);
    if (videoEntry) {
      await Video.delete(videoEntry.id, currentUser.id);
    }

    // Remove from mockPosts array and MongoDB Atlas
    await Post.delete(req.params.id);
    const mockIdx = mockPosts.findIndex(p => p.id === req.params.id);
    if (mockIdx !== -1) {
      mockPosts.splice(mockIdx, 1);
    }

    if (currentUser.postCount && currentUser.postCount > 0) {
      currentUser.postCount -= 1;
    }

    return res.json({
      success: true,
      message: "Post deleted successfully.",
      postId: req.params.id
    });
  } catch (err) {
    console.error('[Delete Post Error]:', err);
    return res.status(500).json({ success: false, message: "Failed to delete post." });
  }
});

export default router;
