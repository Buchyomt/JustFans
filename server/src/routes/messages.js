import express from 'express';
import mongoose from 'mongoose';
import { mockMessages, mockUsers } from '../data/mockData.js';
import { User, MongoUser } from '../models/User.js';
import { MongoMessage, MongoThread, getDeterministicThreadId } from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to look up partner user across memory and MongoDB Atlas
const resolvePartner = async (partnerId) => {
  if (!partnerId) return null;
  let p = User.users.find(u => u.id === partnerId || (u.username && u.username.toLowerCase() === partnerId.toLowerCase()));
  if (p) return p;
  p = await User.findById(partnerId);
  if (p) return p;
  p = await User.findByUsername(partnerId);
  if (p) return p;
  return mockUsers.find(u => u.id === partnerId || (u.username && u.username.toLowerCase() === partnerId.toLowerCase())) || null;
};

// GET /api/messages (PROTECTED) - Fetch all threads and their messages with MongoDB persistence
router.get('/', requireAuth, async (req, res) => {
  const currentUser = req.user;
  const targetCreatorParam = req.query.creator;

  // 1. If a specific creator is requested via query param (e.g. /api/messages?creator=creator-2), ensure deterministic thread exists
  if (targetCreatorParam) {
    const targetPartner = await resolvePartner(targetCreatorParam);
    if (targetPartner && targetPartner.id !== currentUser.id) {
      const deterministicId = getDeterministicThreadId(currentUser.id, targetPartner.id);
      let threadDoc = null;
      if (mongoose.connection.readyState >= 1) {
        try {
          threadDoc = await MongoThread.findOne({ id: deterministicId }).lean();
        } catch (e) {
          console.warn('[MongoThread find error]:', e.message);
        }
      }

      if (!threadDoc) {
        const isPartnerCreator = targetPartner.role === 'creator';
        const welcomeText = `Hey! 💕 Welcome to @${targetPartner.username}'s private VIP chat! Send a message or tip to unlock exclusive content.`;
        const newThread = {
          id: deterministicId,
          participantA: currentUser.id,
          participantB: targetPartner.id,
          creatorId: isPartnerCreator ? targetPartner.id : currentUser.id,
          fanId: isPartnerCreator ? currentUser.id : targetPartner.id,
          lastMessage: welcomeText,
          lastTimestamp: new Date().toISOString()
        };

        if (mongoose.connection.readyState >= 1) {
          try {
            await MongoThread.create(newThread);
            await MongoMessage.create({
              id: `m-welcome-${targetPartner.id}-${currentUser.id}`,
              threadId: deterministicId,
              senderId: targetPartner.id,
              text: welcomeText,
              timestamp: new Date().toISOString(),
              tip: 0
            });
          } catch (e) {
            console.warn('[MongoThread create error]:', e.message);
          }
        }

        // Also sync memory cache
        mockMessages.unshift({
          ...newThread,
          messages: [{
            id: `m-welcome-${targetPartner.id}-${currentUser.id}`,
            senderId: targetPartner.id,
            text: welcomeText,
            timestamp: new Date().toISOString(),
            tip: 0
          }]
        });
      }
    }
  }

  // 2. If user is a fan with zero threads, guarantee they start with Nicole Shayla VIP conversation
  if (currentUser.role === 'fan') {
    const nicoleThreadId = getDeterministicThreadId(currentUser.id, 'creator-1');
    let nicoleThreadDoc = null;
    if (mongoose.connection.readyState >= 1) {
      try {
        nicoleThreadDoc = await MongoThread.findOne({ id: nicoleThreadId }).lean();
      } catch (e) {
        console.warn('[MongoThread Nicole lookup error]:', e.message);
      }
    }

    if (!nicoleThreadDoc) {
      const welcomeText = "Hey babe! 💕 Welcome to my exclusive VIP chat. If you're looking to subscribe ($60/mo) and unlock my full uncut 4K video vault, message me right here to get my approved CashApp, Gift Cards, or Crypto details! 😈 Let me know what payment method works best for you!";
      const nicoleThread = {
        id: nicoleThreadId,
        participantA: currentUser.id,
        participantB: 'creator-1',
        creatorId: 'creator-1',
        fanId: currentUser.id,
        lastMessage: welcomeText,
        lastTimestamp: new Date().toISOString()
      };

      if (mongoose.connection.readyState >= 1) {
        try {
          await MongoThread.create(nicoleThread);
          await MongoMessage.create({
            id: `m-welcome-${currentUser.id}`,
            threadId: nicoleThreadId,
            senderId: 'creator-1',
            text: welcomeText,
            timestamp: new Date().toISOString(),
            tip: 0
          });
        } catch (e) {
          console.warn('[MongoThread Nicole init error]:', e.message);
        }
      }

      mockMessages.unshift({
        ...nicoleThread,
        messages: [{
          id: `m-welcome-${currentUser.id}`,
          senderId: 'creator-1',
          text: welcomeText,
          timestamp: new Date().toISOString(),
          tip: 0
        }]
      });
    }
  }

  // 3. Load all threads for current user from MongoDB Atlas
  let loadedThreads = [];
  if (mongoose.connection.readyState >= 1) {
    try {
      loadedThreads = await MongoThread.find({
        $or: [
          { participantA: currentUser.id },
          { participantB: currentUser.id },
          { creatorId: currentUser.id },
          { fanId: currentUser.id }
        ]
      }).sort({ lastTimestamp: -1 }).lean();
    } catch (e) {
      console.warn('[MongoThread fetch error]:', e.message);
    }
  }

  // Fallback to memory mockMessages if empty or MongoDB offline
  if (!loadedThreads || loadedThreads.length === 0) {
    loadedThreads = mockMessages.filter(t => t.fanId === currentUser.id || t.creatorId === currentUser.id);
  }

  // 4. Enrich each thread with partner profile and full message history from MongoMessage
  const enrichedThreads = await Promise.all(
    loadedThreads.map(async (thread) => {
      const isFan = currentUser.id === thread.fanId;
      const partnerId = isFan ? thread.creatorId : thread.fanId;
      let partner = await resolvePartner(partnerId);
      if (!partner && partnerId === 'creator-1') {
        partner = await resolvePartner('creator-1');
      }

      // Fetch messages from MongoMessage for this thread
      let messages = [];
      if (mongoose.connection.readyState >= 1) {
        try {
          messages = await MongoMessage.find({ threadId: thread.id }).sort({ timestamp: 1 }).lean();
        } catch (e) {
          console.warn('[MongoMessage fetch error]:', e.message);
        }
      }

      // If no messages found in MongoMessage, check memory
      if (!messages || messages.length === 0) {
        const memThread = mockMessages.find(t => t.id === thread.id);
        messages = memThread ? memThread.messages : (thread.messages || []);
      }

      const lastMsg = messages[messages.length - 1];

      return {
        id: thread.id,
        creatorId: thread.creatorId,
        fanId: thread.fanId,
        partner: partner ? {
          id: partner.id,
          name: partner.name,
          username: partner.username,
          avatar: partner.avatar || (partner.id === 'creator-1' ? '/FhNtifmVQAEZDgwy.jpg' : ''),
          role: partner.role,
          verified: Boolean(partner.verified)
        } : {
          id: partnerId,
          name: partnerId === 'creator-1' ? 'Nicole Shayla' : 'Creator',
          username: partnerId === 'creator-1' ? 'uni_ques78' : 'creator',
          avatar: '/FhNtifmVQAEZDgwy.jpg',
          role: 'creator',
          verified: true
        },
        lastMessage: lastMsg?.text || thread.lastMessage || "No messages yet",
        lastTimestamp: lastMsg?.timestamp || thread.lastTimestamp || null,
        messages: messages
      };
    })
  );

  return res.json({
    success: true,
    threads: enrichedThreads
  });
});

// POST /api/messages/start (PROTECTED) - Start or find deterministic chat thread with any creator or user
router.post('/start', requireAuth, async (req, res) => {
  const { partnerId } = req.body;
  const currentUser = req.user;

  if (!partnerId) {
    return res.status(400).json({ success: false, message: 'Partner ID or username is required.' });
  }

  const partner = await resolvePartner(partnerId);

  if (!partner) {
    return res.status(404).json({ success: false, message: 'User or creator not found.' });
  }

  const deterministicId = getDeterministicThreadId(currentUser.id, partner.id);
  const isPartnerCreator = partner.role === 'creator';
  const creatorId = isPartnerCreator ? partner.id : currentUser.id;
  const fanId = isPartnerCreator ? currentUser.id : partner.id;

  let threadDoc = null;
  if (mongoose.connection.readyState >= 1) {
    try {
      threadDoc = await MongoThread.findOne({ id: deterministicId }).lean();
    } catch (e) {
      console.warn('[MongoThread find error]:', e.message);
    }
  }

  if (!threadDoc) {
    const welcomeText = `Hey! 💕 Welcome to @${partner.username}'s chat! Send a message or tip to unlock custom content.`;
    const newThread = {
      id: deterministicId,
      participantA: currentUser.id,
      participantB: partner.id,
      creatorId,
      fanId,
      lastMessage: welcomeText,
      lastTimestamp: new Date().toISOString()
    };

    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoThread.create(newThread);
        await MongoMessage.create({
          id: `m-init-${Date.now()}`,
          threadId: deterministicId,
          senderId: partner.id,
          text: welcomeText,
          timestamp: new Date().toISOString(),
          tip: 0
        });
      } catch (e) {
        console.warn('[MongoThread create error]:', e.message);
      }
    }

    mockMessages.unshift({
      ...newThread,
      messages: [{
        id: `m-init-${Date.now()}`,
        senderId: partner.id,
        text: welcomeText,
        timestamp: new Date().toISOString(),
        tip: 0
      }]
    });
    threadDoc = newThread;
  }

  // Load messages for thread
  let messages = [];
  if (mongoose.connection.readyState >= 1) {
    try {
      messages = await MongoMessage.find({ threadId: deterministicId }).sort({ timestamp: 1 }).lean();
    } catch (e) {
      console.warn('[MongoMessage fetch error]:', e.message);
    }
  }
  if (!messages || messages.length === 0) {
    const mem = mockMessages.find(t => t.id === deterministicId);
    messages = mem ? mem.messages : [];
  }

  const enrichedThread = {
    id: deterministicId,
    creatorId: threadDoc.creatorId,
    fanId: threadDoc.fanId,
    partner: {
      id: partner.id,
      name: partner.name,
      username: partner.username,
      avatar: partner.avatar || (partner.id === 'creator-1' ? '/FhNtifmVQAEZDgwy.jpg' : ''),
      role: partner.role,
      verified: Boolean(partner.verified)
    },
    lastMessage: messages[messages.length - 1]?.text || 'No messages yet',
    lastTimestamp: messages[messages.length - 1]?.timestamp || new Date().toISOString(),
    messages
  };

  return res.json({
    success: true,
    threadId: deterministicId,
    thread: enrichedThread
  });
});

// POST /api/messages/:threadId (PROTECTED) - Send a message into deterministic thread
router.post('/:threadId', requireAuth, async (req, res) => {
  const { threadId } = req.params;
  const { text, tip, isLockedPPV, price, attachmentUrl } = req.body;
  const currentUser = req.user;

  // Resolve target thread
  let resolvedThreadId = threadId;
  let threadDoc = null;

  if (mongoose.connection.readyState >= 1) {
    try {
      threadDoc = await MongoThread.findOne({ id: threadId }).lean();
    } catch (e) {}
  }

  if (!threadDoc) {
    // Check if threadId refers to a creator or fan partner ID
    const partner = await resolvePartner(threadId);
    if (partner) {
      resolvedThreadId = getDeterministicThreadId(currentUser.id, partner.id);
      if (mongoose.connection.readyState >= 1) {
        try {
          threadDoc = await MongoThread.findOne({ id: resolvedThreadId }).lean();
        } catch (e) {}
      }

      if (!threadDoc) {
        const isPartnerCreator = partner.role === 'creator';
        threadDoc = {
          id: resolvedThreadId,
          participantA: currentUser.id,
          participantB: partner.id,
          creatorId: isPartnerCreator ? partner.id : currentUser.id,
          fanId: isPartnerCreator ? currentUser.id : partner.id,
          lastMessage: '',
          lastTimestamp: new Date().toISOString()
        };
        if (mongoose.connection.readyState >= 1) {
          try {
            await MongoThread.create(threadDoc);
          } catch (e) {}
        }
      }
    }
  }

  if (!threadDoc) {
    // Memory fallback
    let memThread = mockMessages.find(t => t.id === threadId);
    if (memThread) {
      threadDoc = memThread;
      resolvedThreadId = memThread.id;
    }
  }

  if (!threadDoc) {
    return res.status(404).json({ success: false, message: "Chat conversation not found." });
  }

  const tipNum = Number(tip) || 0;
  if (tipNum > 0) {
    if (currentUser.walletBalance < tipNum) {
      return res.status(400).json({ success: false, message: "Insufficient balance for this tip." });
    }
    currentUser.walletBalance -= tipNum;
    if (mongoose.connection.readyState >= 1) {
      try {
        await MongoUser.updateOne({ id: currentUser.id }, { $inc: { walletBalance: -tipNum } });
      } catch (e) {}
    }
  }

  const newMsg = {
    id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    threadId: resolvedThreadId,
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

  // Persist message to MongoDB Atlas
  if (mongoose.connection.readyState >= 1) {
    try {
      await MongoMessage.create(newMsg);
      await MongoThread.updateOne(
        { id: resolvedThreadId },
        { lastMessage: newMsg.text, lastTimestamp: newMsg.timestamp }
      );
    } catch (msgErr) {
      console.warn('[MongoMessage save warning]:', msgErr.message);
    }
  }

  // Sync memory cache
  let mem = mockMessages.find(t => t.id === resolvedThreadId);
  if (!mem) {
    mem = { ...threadDoc, messages: [] };
    mockMessages.push(mem);
  }
  mem.messages.push(newMsg);

  // If fan is messaging Nicole Shayla (creator-1), provide real-time payment assistance auto-replies
  let autoReply = null;
  const isMessagingNicole = threadDoc.creatorId === 'creator-1' || threadDoc.participantB === 'creator-1' || threadDoc.participantA === 'creator-1';

  if (currentUser.role === 'fan' && isMessagingNicole) {
    const lower = (text || '').toLowerCase();
    if (lower.includes('paid') || lower.includes('sent') || lower.includes('notification') || lower.includes('proof')) {
      autoReply = {
        id: `m-nicole-${Date.now() + 1}`,
        threadId: resolvedThreadId,
        senderId: 'creator-1',
        text: "Got your payment notice babe! 🥰 I'm verifying the transaction on my end right now. Once verified, you can enter VIP Activation Code: VIP60 in the subscribe popup or I will activate your vault access directly! 💦",
        timestamp: new Date(Date.now() + 1200).toISOString(),
        tip: 0
      };
    } else if (
      lower.includes('pay') || lower.includes('cashapp') || lower.includes('cash app') ||
      lower.includes('gift') || lower.includes('card') || lower.includes('crypto') || 
      lower.includes('subscribe') || lower.includes('method') || lower.includes('how') || 
      lower.includes('cost') || lower.includes('price') || lower.includes('access')
    ) {
      autoReply = {
        id: `m-nicole-${Date.now() + 1}`,
        threadId: resolvedThreadId,
        senderId: 'creator-1',
        text: "Hey love! 😈 Here are my approved direct payment methods for full VIP vault access ($60.00/mo):\n\n💸 CashApp: Request my active Cashtag in this chat\n🎁 Gift Cards: Apple, Steam, Amazon, Vanilla Visa (send code & receipt here)\n⚡ Crypto (USDT-TRC20 / BTC): DM me for wallet address\n\nOnce sent, reply here so I can verify and activate your VIP Access! 💕",
        timestamp: new Date(Date.now() + 1200).toISOString(),
        tip: 0
      };
    }

    if (autoReply) {
      if (mongoose.connection.readyState >= 1) {
        try {
          await MongoMessage.create(autoReply);
          await MongoThread.updateOne(
            { id: resolvedThreadId },
            { lastMessage: autoReply.text, lastTimestamp: autoReply.timestamp }
          );
        } catch (e) {}
      }
      mem.messages.push(autoReply);
    }
  }

  return res.status(201).json({
    success: true,
    message: newMsg,
    autoReply,
    threadId: resolvedThreadId,
    newBalance: currentUser.walletBalance
  });
});

// POST /api/messages/:threadId/unlock-ppv (PROTECTED) - Unlock pay-per-view media
router.post('/:threadId/unlock-ppv', requireAuth, async (req, res) => {
  const { threadId } = req.params;
  const { messageId } = req.body;
  const currentUser = req.user;

  let msg = null;
  if (mongoose.connection.readyState >= 1) {
    try {
      msg = await MongoMessage.findOne({ id: messageId });
    } catch (e) {}
  }

  if (!msg) {
    const thread = mockMessages.find(t => t.id === threadId);
    msg = thread?.messages?.find(m => m.id === messageId);
  }

  if (!msg || !msg.isLockedPPV) {
    return res.status(404).json({ success: false, message: "PPV message not found." });
  }

  const cost = msg.price || 4.99;
  if (currentUser.walletBalance < cost) {
    return res.status(400).json({ success: false, message: "Insufficient wallet funds." });
  }

  currentUser.walletBalance -= cost;
  msg.unlocked = true;

  if (mongoose.connection.readyState >= 1) {
    try {
      await MongoMessage.updateOne({ id: messageId }, { unlocked: true });
      await MongoUser.updateOne({ id: currentUser.id }, { $inc: { walletBalance: -cost } });
    } catch (e) {}
  }

  return res.json({
    success: true,
    message: "Media unlocked!",
    messageObj: msg,
    newBalance: currentUser.walletBalance
  });
});

export default router;
