import express from 'express';
import { mockUsers } from '../data/mockData.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/subscriptions/my (PROTECTED)
router.get('/my', requireAuth, (req, res) => {
  const currentUser = req.user;
  const subs = (currentUser.subscriptions || []).map(sub => {
    const creator = mockUsers.find(u => u.id === sub.creatorId);
    return {
      ...sub,
      creator: creator ? {
        id: creator.id,
        name: creator.name,
        username: creator.username,
        avatar: creator.avatar,
        verified: creator.verified,
        category: creator.category
      } : null
    };
  });

  res.json({
    success: true,
    subscriptions: subs
  });
});

// POST /api/subscriptions/subscribe (PROTECTED)
router.post('/subscribe', requireAuth, (req, res) => {
  const { creatorId, tierName, price } = req.body;
  const creator = mockUsers.find(u => u.id === creatorId && u.role === 'creator');

  if (!creator) {
    return res.status(404).json({ success: false, message: "Creator not found." });
  }

  const currentUser = req.user;
  const subCost = Number(price) || creator.monthlyPrice || 9.99;

  if (currentUser.walletBalance < subCost) {
    return res.status(400).json({
      success: false,
      message: "Insufficient wallet balance to subscribe. Please add funds."
    });
  }

  if (!currentUser.subscriptions) currentUser.subscriptions = [];

  const existingIdx = currentUser.subscriptions.findIndex(s => s.creatorId === creatorId);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const subRecord = {
    creatorId,
    tier: tierName || "Standard",
    price: subCost,
    expiresAt: expiryDate.toISOString().split('T')[0]
  };

  if (existingIdx > -1) {
    currentUser.subscriptions[existingIdx] = subRecord;
  } else {
    currentUser.subscriptions.push(subRecord);
    creator.subscriberCount = (creator.subscriberCount || 0) + 1;
  }

  currentUser.walletBalance -= subCost;

  res.json({
    success: true,
    message: `Subscribed to ${creator.name} (${subRecord.tier})!`,
    subscription: subRecord,
    newBalance: currentUser.walletBalance
  });
});

// POST /api/subscriptions/cancel (PROTECTED)
router.post('/cancel', requireAuth, (req, res) => {
  const { creatorId } = req.body;
  const currentUser = req.user;

  if (!currentUser.subscriptions) {
    return res.status(400).json({ success: false, message: "No active subscriptions." });
  }

  const idx = currentUser.subscriptions.findIndex(s => s.creatorId === creatorId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Subscription not found." });
  }

  currentUser.subscriptions.splice(idx, 1);
  const creator = mockUsers.find(u => u.id === creatorId);
  if (creator && creator.subscriberCount > 0) {
    creator.subscriberCount -= 1;
  }

  res.json({
    success: true,
    message: "Subscription cancelled successfully."
  });
});

export default router;
