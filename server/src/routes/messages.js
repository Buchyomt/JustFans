import express from 'express';
import { mockMessages, mockUsers } from '../data/mockData.js';
import { getCurrentUser } from './auth.js';

const router = express.Router();

// GET /api/messages
router.get('/', (req, res) => {
  const currentUser = getCurrentUser();

  const userThreads = mockMessages.filter(t => 
    t.fanId === currentUser.id || t.creatorId === currentUser.id
  ).map(thread => {
    const isFan = currentUser.id === thread.fanId;
    const partnerId = isFan ? thread.creatorId : thread.fanId;
    const partner = mockUsers.find(u => u.id === partnerId);
    const lastMsg = thread.messages[thread.messages.length - 1];

    return {
      id: thread.id,
      creatorId: thread.creatorId,
      fanId: thread.fanId,
      partner: partner ? {
        id: partner.id,
        name: partner.name,
        username: partner.username,
        avatar: partner.avatar,
        role: partner.role,
        verified: partner.verified
      } : null,
      lastMessage: lastMsg?.text || "No messages yet",
      lastTimestamp: lastMsg?.timestamp || null,
      messages: thread.messages
    };
  });

  res.json({
    success: true,
    threads: userThreads
  });
});

// POST /api/messages/:threadId
router.post('/:threadId', (req, res) => {
  const { threadId } = req.params;
  const { text, tip, isLockedPPV, price, attachmentUrl } = req.body;
  const currentUser = getCurrentUser();

  let thread = mockMessages.find(t => t.id === threadId);
  if (!thread) {
    // Check if threadId is actually a creatorId or fanId to start a new thread
    const creator = mockUsers.find(u => u.id === threadId || u.username === threadId);
    if (creator) {
      thread = {
        id: `thread-${Date.now()}`,
        creatorId: creator.id,
        fanId: currentUser.id,
        messages: []
      };
      mockMessages.push(thread);
    } else {
      return res.status(404).json({ success: false, message: "Chat thread not found." });
    }
  }

  const tipNum = Number(tip) || 0;
  if (tipNum > 0) {
    if (currentUser.walletBalance < tipNum) {
      return res.status(400).json({ success: false, message: "Insufficient balance for this tip." });
    }
    currentUser.walletBalance -= tipNum;
  }

  const newMsg = {
    id: `m-${Date.now()}`,
    senderId: currentUser.id,
    text: text || (isLockedPPV ? "Sent a locked PPV media" : ""),
    timestamp: new Date().toISOString(),
    tip: tipNum,
    ...(isLockedPPV ? {
      isLockedPPV: true,
      price: Number(price) || 4.99,
      unlocked: false,
      attachmentUrl: attachmentUrl || "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&auto=format&fit=crop&q=80"
    } : {})
  };

  thread.messages.push(newMsg);

  res.status(201).json({
    success: true,
    message: newMsg,
    threadId: thread.id,
    newBalance: currentUser.walletBalance
  });
});

// POST /api/messages/:threadId/unlock-ppv
router.post('/:threadId/unlock-ppv', (req, res) => {
  const { threadId } = req.params;
  const { messageId } = req.body;
  const currentUser = getCurrentUser();

  const thread = mockMessages.find(t => t.id === threadId);
  if (!thread) {
    return res.status(404).json({ success: false, message: "Thread not found." });
  }

  const msg = thread.messages.find(m => m.id === messageId);
  if (!msg || !msg.isLockedPPV) {
    return res.status(404).json({ success: false, message: "PPV message not found." });
  }

  const cost = msg.price || 4.99;
  if (currentUser.walletBalance < cost) {
    return res.status(400).json({ success: false, message: "Insufficient wallet funds." });
  }

  currentUser.walletBalance -= cost;
  msg.unlocked = true;

  res.json({
    success: true,
    message: "Media unlocked!",
    messageObj: msg,
    newBalance: currentUser.walletBalance
  });
});

export default router;
