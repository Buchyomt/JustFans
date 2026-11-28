import express from 'express';
import { mockMessages, mockUsers } from '../data/mockData.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages (PROTECTED)
router.get('/', requireAuth, (req, res) => {
  const currentUser = req.user;
  const targetCreatorParam = req.query.creator;

  // If a specific creator is requested via query param (e.g. /api/messages?creator=creator-2), ensure a thread exists
  if (targetCreatorParam) {
    const targetPartner = mockUsers.find(u => 
      u.id === targetCreatorParam || 
      (u.username && u.username.toLowerCase() === targetCreatorParam.toLowerCase())
    );
    if (targetPartner) {
      let existingThread = mockMessages.find(t => 
        (t.creatorId === targetPartner.id && t.fanId === currentUser.id) ||
        (t.creatorId === currentUser.id && t.fanId === targetPartner.id)
      );
      if (!existingThread) {
        existingThread = {
          id: `thread-${targetPartner.id}-${currentUser.id}`,
          creatorId: targetPartner.id,
          fanId: currentUser.id,
          messages: [
            {
              id: `m-welcome-${targetPartner.id}-${currentUser.id}`,
              senderId: targetPartner.id,
              text: `Hey! 💕 Welcome to @${targetPartner.username}'s private VIP chat! Send a message or tip to unlock exclusive content.`,
              timestamp: new Date().toISOString(),
              tip: 0
            }
          ]
        };
        mockMessages.unshift(existingThread);
      }
    }
  }

  // If user is a fan with zero threads, guarantee they start with a conversation
  if (currentUser.role === 'fan') {
    let nicoleThread = mockMessages.find(t => 
      (t.creatorId === 'creator-1' && t.fanId === currentUser.id) ||
      (t.creatorId === currentUser.id && t.fanId === 'creator-1')
    );

    if (!nicoleThread) {
      nicoleThread = {
        id: `thread-nicole-${currentUser.id}`,
        creatorId: 'creator-1',
        fanId: currentUser.id,
        messages: [
          {
            id: `m-welcome-${currentUser.id}`,
            senderId: 'creator-1',
            text: "Hey babe! 💕 Welcome to my exclusive VIP chat. If you're looking to subscribe ($60/mo) and unlock my full uncut 4K video vault, message me right here to get my approved CashApp, Gift Cards, or Crypto details! 😈 Let me know what payment method works best for you!",
            timestamp: new Date().toISOString(),
            tip: 0
          }
        ]
      };
      mockMessages.unshift(nicoleThread);
    }
  }

  const userThreads = mockMessages.filter(t => 
    t.fanId === currentUser.id || t.creatorId === currentUser.id
  ).map(thread => {
    const isFan = currentUser.id === thread.fanId;
    const partnerId = isFan ? thread.creatorId : thread.fanId;
    let partner = mockUsers.find(u => u.id === partnerId);
    if (!partner && partnerId === 'creator-1') {
      partner = mockUsers.find(u => u.id === 'creator-1');
    }
    const lastMsg = thread.messages[thread.messages.length - 1];

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
        verified: partner.verified
      } : {
        id: partnerId,
        name: partnerId === 'creator-1' ? 'Nicole Shayla' : 'Creator',
        username: partnerId === 'creator-1' ? 'uni_ques78' : 'creator',
        avatar: '/FhNtifmVQAEZDgwy.jpg',
        role: 'creator',
        verified: true
      },
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

// POST /api/messages/start (PROTECTED) - Start or find chat thread with any creator or user
router.post('/start', requireAuth, (req, res) => {
  const { partnerId } = req.body;
  const currentUser = req.user;

  if (!partnerId) {
    return res.status(400).json({ success: false, message: 'Partner ID or username is required.' });
  }

  const partner = mockUsers.find(u => 
    u.id === partnerId || 
    (u.username && u.username.toLowerCase() === partnerId.toLowerCase())
  );

  if (!partner) {
    return res.status(404).json({ success: false, message: 'User or creator not found.' });
  }

  let thread = mockMessages.find(t => 
    (t.creatorId === partner.id && t.fanId === currentUser.id) ||
    (t.creatorId === currentUser.id && t.fanId === partner.id)
  );

  if (!thread) {
    const isPartnerCreator = partner.role === 'creator';
    thread = {
      id: `thread-${partner.id}-${currentUser.id}`,
      creatorId: isPartnerCreator ? partner.id : currentUser.id,
      fanId: isPartnerCreator ? currentUser.id : partner.id,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          senderId: partner.id,
          text: `Hey! 💕 Welcome to @${partner.username}'s chat! Send a message or tip to unlock custom content.`,
          timestamp: new Date().toISOString(),
          tip: 0
        }
      ]
    };
    mockMessages.unshift(thread);
  }

  const partnerUser = mockUsers.find(u => u.id === (currentUser.id === thread.fanId ? thread.creatorId : thread.fanId)) || partner;
  const enrichedThread = {
    ...thread,
    partner: {
      id: partnerUser.id,
      name: partnerUser.name,
      username: partnerUser.username,
      avatar: partnerUser.avatar || (partnerUser.id === 'creator-1' ? '/FhNtifmVQAEZDgwy.jpg' : ''),
      role: partnerUser.role,
      verified: partnerUser.verified
    },
    lastMessage: thread.messages[thread.messages.length - 1]?.text || 'No messages yet',
    lastTimestamp: thread.messages[thread.messages.length - 1]?.timestamp || new Date().toISOString()
  };

  return res.json({
    success: true,
    threadId: thread.id,
    thread: enrichedThread
  });
});

// POST /api/messages/:threadId (PROTECTED)
router.post('/:threadId', requireAuth, (req, res) => {
  const { threadId } = req.params;
  const { text, tip, isLockedPPV, price, attachmentUrl } = req.body;
  const currentUser = req.user;

  let thread = mockMessages.find(t => t.id === threadId);
  if (!thread) {
    // Check if threadId refers to creatorId or fan partner
    thread = mockMessages.find(t => 
      (t.creatorId === threadId && t.fanId === currentUser.id) ||
      (t.fanId === threadId && t.creatorId === currentUser.id)
    );
  }
  if (!thread) {
    const partner = mockUsers.find(u => u.id === threadId || u.username === threadId) || 
      (threadId === 'creator-1' || threadId === 'uni_ques78' ? mockUsers.find(u => u.id === 'creator-1') : null);

    if (partner) {
      const isPartnerCreator = partner.role === 'creator';
      thread = {
        id: `thread-${Date.now()}`,
        creatorId: isPartnerCreator ? partner.id : currentUser.id,
        fanId: isPartnerCreator ? currentUser.id : partner.id,
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

  // If fan is messaging Nicole Shayla (creator-1), provide real-time payment assistance auto-replies
  let autoReply = null;
  if (currentUser.role === 'fan' && thread.creatorId === 'creator-1') {
    const lower = (text || '').toLowerCase();
    if (lower.includes('paid') || lower.includes('sent') || lower.includes('notification') || lower.includes('proof')) {
      autoReply = {
        id: `m-nicole-${Date.now() + 1}`,
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
        senderId: 'creator-1',
        text: "Hey love! 😈 Here are my approved direct payment methods for full VIP vault access ($60.00/mo):\n\n💸 CashApp: Request my active Cashtag in this chat\n🎁 Gift Cards: Apple, Steam, Amazon, Vanilla Visa (send code & receipt here)\n⚡ Crypto (USDT-TRC20 / BTC): DM me for wallet address\n\nOnce sent, reply here so I can verify and activate your VIP Access! 💕",
        timestamp: new Date(Date.now() + 1200).toISOString(),
        tip: 0
      };
    }

    if (autoReply) {
      thread.messages.push(autoReply);
    }
  }

  res.status(201).json({
    success: true,
    message: newMsg,
    autoReply,
    threadId: thread.id,
    newBalance: currentUser.walletBalance
  });
});

// POST /api/messages/:threadId/unlock-ppv (PROTECTED)
router.post('/:threadId/unlock-ppv', requireAuth, (req, res) => {
  const { threadId } = req.params;
  const { messageId } = req.body;
  const currentUser = req.user;

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
