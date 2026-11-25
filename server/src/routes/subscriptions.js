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

// Dynamic in-memory store for VIP promo & activation codes
const dynamicVipCodes = [
  { code: 'VIP60', creatorId: 'creator-1', tier: 'Standard Fan', price: 60.00, uses: 48, maxUses: 9999, createdAt: '2026-11-01T00:00:00Z', note: 'Standard VIP Access ($60)' },
  { code: 'VIP99', creatorId: 'creator-1', tier: 'VIP All-Access', price: 99.00, uses: 19, maxUses: 9999, createdAt: '2026-11-01T00:00:00Z', note: 'VIP All-Access + Priority DM ($99)' },
  { code: 'NICOLE2026', creatorId: 'creator-1', tier: 'Standard Fan', price: 60.00, uses: 12, maxUses: 9999, createdAt: '2026-11-05T00:00:00Z', note: 'Launch Promo Code' }
];

// GET /api/subscriptions/subscribers (PROTECTED - Creator Only)
router.get('/subscribers', requireAuth, (req, res) => {
  const currentUser = req.user;
  if (currentUser.role !== 'creator' && currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Only creators can view subscriber roster." });
  }

  const creatorId = currentUser.id;
  const subscriberFans = [];

  mockUsers.forEach(u => {
    const sub = u.subscriptions?.find(s => s.creatorId === creatorId);
    if (sub) {
      subscriberFans.push({
        id: u.id,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
        tier: sub.tier,
        price: sub.price,
        expiresAt: sub.expiresAt
      });
    }
  });

  return res.json({
    success: true,
    count: subscriberFans.length,
    subscribers: subscriberFans
  });
});

// GET /api/subscriptions/vip-codes (PROTECTED - Creator Only)
router.get('/vip-codes', requireAuth, (req, res) => {
  const currentUser = req.user;
  if (currentUser.role !== 'creator' && currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Only creators can view activation codes." });
  }

  const codes = dynamicVipCodes.filter(c => c.creatorId === currentUser.id);
  return res.json({
    success: true,
    codes
  });
});

// POST /api/subscriptions/generate-code (PROTECTED - Creator Only)
router.post('/generate-code', requireAuth, (req, res) => {
  const currentUser = req.user;
  if (currentUser.role !== 'creator' && currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Only creators can generate VIP codes." });
  }

  const { customCode, tier = 'Standard Fan', price = 60.00, note } = req.body;
  const generatedCode = (customCode && customCode.trim())
    ? customCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    : `VIP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const existing = dynamicVipCodes.find(c => c.code === generatedCode);
  if (existing) {
    return res.status(400).json({ success: false, message: `Code ${generatedCode} already exists.` });
  }

  const newCodeRecord = {
    code: generatedCode,
    creatorId: currentUser.id,
    tier,
    price: Number(price) || 60.00,
    uses: 0,
    maxUses: 100,
    createdAt: new Date().toISOString(),
    note: note || `Generated for paying fan via chat`
  };

  dynamicVipCodes.unshift(newCodeRecord);

  return res.status(201).json({
    success: true,
    message: `VIP code ${generatedCode} generated successfully!`,
    code: newCodeRecord
  });
});

// POST /api/subscriptions/redeem-code (PROTECTED) - Redeem VIP code provided by Nicole in chat
router.post('/redeem-code', requireAuth, (req, res) => {
  const { code, creatorId = 'creator-1' } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();

  const foundDynamic = dynamicVipCodes.find(c => c.code === cleanCode);
  const VALID_FALLBACK_CODES = ['VIP60', 'VIP99', 'NICOLE2026', 'SHAYLA60', 'ACCESS60'];

  if (!foundDynamic && !VALID_FALLBACK_CODES.includes(cleanCode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid VIP activation code. Please message Nicole to receive your verified payment code.'
    });
  }

  const targetCreatorId = foundDynamic?.creatorId || creatorId;
  const creator = mockUsers.find(u => u.id === targetCreatorId);
  const currentUser = req.user;

  if (!currentUser.subscriptions) currentUser.subscriptions = [];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  const tier = foundDynamic ? foundDynamic.tier : (cleanCode === 'VIP99' ? 'VIP All-Access' : 'Standard Fan');
  const price = foundDynamic ? foundDynamic.price : (cleanCode === 'VIP99' ? 99.00 : 60.00);

  const subRecord = {
    creatorId: targetCreatorId,
    tier,
    price,
    expiresAt: expiryDate.toISOString().split('T')[0]
  };

  const existingIdx = currentUser.subscriptions.findIndex(s => s.creatorId === targetCreatorId);
  if (existingIdx > -1) {
    currentUser.subscriptions[existingIdx] = subRecord;
  } else {
    currentUser.subscriptions.push(subRecord);
    if (creator) {
      creator.subscriberCount = (creator.subscriberCount || 0) + 1;
    }
  }

  if (foundDynamic) {
    foundDynamic.uses = (foundDynamic.uses || 0) + 1;
  }

  return res.json({
    success: true,
    message: `🎉 VIP Access Activated! Welcome to ${creator?.name || 'Nicole'}'s exclusive vault.`,
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
