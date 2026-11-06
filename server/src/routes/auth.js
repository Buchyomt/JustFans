import express from 'express';
import { mockUsers } from '../data/mockData.js';

const router = express.Router();

// Current active session user (defaults to Demo Fan Alex)
let currentUserId = "user-fan-1";

export const getCurrentUser = () => {
  return mockUsers.find(u => u.id === currentUserId) || mockUsers[0];
};

export const setCurrentUser = (id) => {
  currentUserId = id;
};

// GET /api/auth/me
router.get('/me', (req, res) => {
  const user = getCurrentUser();
  res.json({
    success: true,
    user
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, username } = req.body;
  const user = mockUsers.find(u => 
    (email && u.email.toLowerCase() === email.toLowerCase()) ||
    (username && u.username.toLowerCase() === username.toLowerCase())
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with those credentials."
    });
  }

  setCurrentUser(user.id);
  res.json({
    success: true,
    message: `Logged in as ${user.name}`,
    user
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, name, email, role, category, bio } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: "Username and email are required." });
  }

  const existing = mockUsers.find(u => u.username === username || u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "Username or email is already taken." });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    name: name || username,
    email,
    role: role || "fan",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: bio || (role === "creator" ? "New Creator on JustFans!" : "Content lover & supporter."),
    walletBalance: 50.00,
    following: [],
    subscriptions: [],
    bookmarks: [],
    ...(role === "creator" ? {
      category: category || "General",
      subscriberCount: 0,
      postCount: 0,
      likeCount: 0,
      monthlyPrice: 9.99,
      vipPrice: 19.99,
      verified: false,
      tiers: [
        {
          id: `tier-${Date.now()}`,
          name: "Standard Fan",
          price: 9.99,
          perks: ["Access to exclusive feed", "Comment & direct messaging"]
        }
      ]
    } : {})
  };

  mockUsers.push(newUser);
  setCurrentUser(newUser.id);

  res.status(201).json({
    success: true,
    message: "Registration successful!",
    user: newUser
  });
});

// POST /api/auth/switch-demo (Switch effortlessly between fan & creator accounts)
router.post('/switch-demo', (req, res) => {
  const { userId } = req.body;
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "Demo user not found." });
  }
  setCurrentUser(user.id);
  res.json({
    success: true,
    message: `Switched demo account to ${user.name} (${user.role})`,
    user
  });
});

export default router;
