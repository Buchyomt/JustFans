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

// POST /api/subscriptions/redeem-code (PROTECTED) - Redeem VIP code provided by Nicole in chat
router.post('/redeem-code', requireAuth, (req, res) => {
  const { code, creatorId = 'creator-1' } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();

  const VALID_CODES = ['VIP60', 'VIP99', 'NICOLE2026', 'SHAYLA60', 'ACCESS60'];
  if (!VALID_CODES.includes(cleanCode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid VIP activation code. Please message Nicole to receive your verified payment code.'
    });
  }

  const creator = mockUsers.find(u => u.id === creatorId);
  const currentUser = req.user;

  if (!currentUser.subscriptions) currentUser.subscriptions = [];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const tier = cleanCode === 'VIP99' ? 'VIP All-Access' : 'Standard Fan';
  const price = cleanCode === 'VIP99' ? 99.00 : 60.00;

  const subRecord = {
    creatorId,
    tier,
    price,
    expiresAt: expiryDate.toISOString().split('T')[0]
  };

  const existingIdx = currentUser.subscriptions.findIndex(s => s.creatorId === creatorId);
  if (existingIdx > -1) {
    currentUser.subscriptions[existingIdx] = subRecord;
  } else {
    currentUser.subscriptions.push(subRecord);
    if (creator) {
      creator.subscriberCount = (creator.subscriberCount || 0) + 1;
    }
  }

  return res.json({
    success: true,
    message: `🎉 VIP Access Activated! Welcome to Nicole Shayla's exclusive vault.`,
    subscription: subRecord
  });
});

// POST /api/subscriptions/grant-access (PROTECTED) - Creator or Admin grants VIP access to a fan
router.post('/grant-access', requireAuth, (req, res) => {
  const { fanId, creatorId = 'creator-1', tierName = 'Standard Fan' } = req.body;
  const currentUser = req.user;

  // Must be creator or admin
  if (currentUser.role !== 'creator' && currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Only creators or admins can grant access." });
  }

  const fan = mockUsers.find(u => u.id === fanId || u.username === fanId);
  if (!fan) {
    return res.status(404).json({ success: false, message: "Fan user account not found." });
  }

  const creator = mockUsers.find(u => u.id === creatorId) || currentUser;

  if (!fan.subscriptions) fan.subscriptions = [];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const subRecord = {
    creatorId: creator.id,
    tier: tierName,
    price: 60.00,
    expiresAt: expiryDate.toISOString().split('T')[0]
  };

  const existingIdx = fan.subscriptions.findIndex(s => s.creatorId === creator.id);
  if (existingIdx > -1) {
    fan.subscriptions[existingIdx] = subRecord;
  } else {
    fan.subscriptions.push(subRecord);
    creator.subscriberCount = (creator.subscriberCount || 0) + 1;
  }

  return res.json({
    success: true,
    message: `VIP Access granted to @${fan.username} successfully!`,
    subscription: subRecord
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
