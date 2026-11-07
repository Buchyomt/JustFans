import express from 'express';
import { mockUsers, mockPosts } from '../data/mockData.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/creators
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let creators = mockUsers.filter(u => u.role === 'creator');

  if (category && category !== 'All') {
    creators = creators.filter(c => c.category && c.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    creators = creators.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      (c.bio && c.bio.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: creators.length,
    creators
  });
});

// GET /api/creators/:username
router.get('/:username', optionalAuth, (req, res) => {
  const { username } = req.params;
  const creator = mockUsers.find(u => u.role === 'creator' && (u.username.toLowerCase() === username.toLowerCase() || u.id === username));

  if (!creator) {
    return res.status(404).json({ success: false, message: "Creator not found." });
  }

  const posts = mockPosts.filter(p => p.creatorId === creator.id);
  const currentUser = req.user;
  const isSubscribed = currentUser ? currentUser.subscriptions?.some(s => s.creatorId === creator.id) : false;
  const isFollowing = currentUser ? currentUser.following?.includes(creator.id) : false;

  res.json({
    success: true,
    creator: {
      ...creator,
      isSubscribed: Boolean(isSubscribed),
      isFollowing: Boolean(isFollowing),
      postsCount: posts.length
    },
    posts
  });
});

// POST /api/creators/:id/follow (PROTECTED)
router.post('/:id/follow', requireAuth, (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;
  if (!currentUser.following) currentUser.following = [];

  const index = currentUser.following.indexOf(id);
  let isFollowing = false;
  if (index > -1) {
    currentUser.following.splice(index, 1);
    isFollowing = false;
  } else {
    currentUser.following.push(id);
    isFollowing = true;
  }

  res.json({
    success: true,
    isFollowing,
    followingCount: currentUser.following.length,
    message: isFollowing ? "Creator followed!" : "Creator unfollowed."
  });
});

export default router;
