import express from 'express';
import { mockPosts, mockUsers } from '../data/mockData.js';
import { getCurrentUser } from './auth.js';

const router = express.Router();

// Helper to enrich post with creator details & viewer access
const enrichPost = (post, currentUser) => {
  const creator = mockUsers.find(u => u.id === post.creatorId);
  const isSubscribed = currentUser.subscriptions?.some(s => s.creatorId === post.creatorId);
  const isCreatorSelf = currentUser.id === post.creatorId;
  const isPurchased = post.unlockedUsers?.includes(currentUser.id);
  const isBookmarked = currentUser.bookmarks?.includes(post.id);

  // Content is accessible if it's free, viewer is subscribed, viewer bought PPV, or viewer is author
  const hasAccess = !post.isLocked || isSubscribed || isPurchased || isCreatorSelf;

  return {
    ...post,
    hasAccess,
    isSubscribed,
    isBookmarked: Boolean(isBookmarked),
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

// GET /api/posts
router.get('/', (req, res) => {
  const { filter, creatorId, mediaType } = req.query;
  const currentUser = getCurrentUser();

  let posts = [...mockPosts];

  if (creatorId) {
    posts = posts.filter(p => p.creatorId === creatorId);
  }

  if (mediaType && mediaType !== 'all') {
    posts = posts.filter(p => p.mediaType === mediaType);
  }

  if (filter === 'following') {
    posts = posts.filter(p => currentUser.following?.includes(p.creatorId));
  } else if (filter === 'subscribed') {
    const subCreatorIds = currentUser.subscriptions?.map(s => s.creatorId) || [];
    posts = posts.filter(p => subCreatorIds.includes(p.creatorId));
  } else if (filter === 'bookmarked') {
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
router.get('/:id', (req, res) => {
  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = getCurrentUser();
  res.json({
    success: true,
    post: enrichPost(post, currentUser)
  });
});

// POST /api/posts
router.post('/', (req, res) => {
  const currentUser = getCurrentUser();
  if (currentUser.role !== 'creator') {
    return res.status(403).json({ success: false, message: "Only creators can publish posts." });
  }

  const { title, caption, mediaType, mediaUrl, thumbnail, isLocked, requiredTier, priceToUnlock, tags } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Post title is required." });
  }

  const newPost = {
    id: `post-${Date.now()}`,
    creatorId: currentUser.id,
    title,
    caption: caption || "",
    mediaType: mediaType || "image",
    mediaUrl: mediaUrl || "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    thumbnail: thumbnail || mediaUrl || "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
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

  mockPosts.unshift(newPost);
  currentUser.postCount = (currentUser.postCount || 0) + 1;

  res.status(201).json({
    success: true,
    message: "Post published successfully!",
    post: enrichPost(newPost, currentUser)
  });
});

// POST /api/posts/:id/like
router.post('/:id/like', (req, res) => {
  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  post.likes = (post.likes || 0) + 1;
  const creator = mockUsers.find(u => u.id === post.creatorId);
  if (creator) {
    creator.likeCount = (creator.likeCount || 0) + 1;
  }

  res.json({
    success: true,
    likes: post.likes
  });
});

// POST /api/posts/:id/comment
router.post('/:id/comment', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "Comment text cannot be empty." });
  }

  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = getCurrentUser();
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

// POST /api/posts/:id/tip
router.post('/:id/tip', (req, res) => {
  const { amount, message } = req.body;
  const tipAmount = Number(amount);
  if (!tipAmount || tipAmount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid tip amount." });
  }

  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = getCurrentUser();
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

// POST /api/posts/:id/unlock (Pay-Per-View unlock)
router.post('/:id/unlock', (req, res) => {
  const post = mockPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found." });
  }

  const currentUser = getCurrentUser();
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

// POST /api/posts/:id/bookmark
router.post('/:id/bookmark', (req, res) => {
  const currentUser = getCurrentUser();
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

export default router;
