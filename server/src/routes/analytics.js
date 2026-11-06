import express from 'express';
import { mockPosts, mockUsers } from '../data/mockData.js';
import { getCurrentUser } from './auth.js';

const router = express.Router();

// GET /api/analytics/creator-studio
router.get('/creator-studio', (req, res) => {
  const currentUser = getCurrentUser();

  // If user is a fan, find the first creator to simulate studio or return empty
  const creator = currentUser.role === 'creator' 
    ? currentUser 
    : mockUsers.find(u => u.role === 'creator');

  const creatorPosts = mockPosts.filter(p => p.creatorId === creator.id);

  const subRevenue = (creator.subscriberCount || 0) * (creator.monthlyPrice || 9.99);
  const totalTips = creatorPosts.reduce((acc, p) => acc + (p.tipsTotal || 0), 1420);
  const totalPPV = 3280;
  const netEarnings = subRevenue + totalTips + totalPPV;

  res.json({
    success: true,
    creator: {
      id: creator.id,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar,
      subscribers: creator.subscriberCount || 4820,
      likes: creator.likeCount || 94300,
      postsCount: creatorPosts.length
    },
    metrics: {
      totalEarnings: netEarnings,
      monthlyRecurringRevenue: subRevenue,
      tipsEarnings: totalTips,
      ppvEarnings: totalPPV,
      activeSubscribers: creator.subscriberCount || 4820,
      subscriberGrowthPercentage: "+18.4%",
      avgTipAmount: 14.50
    },
    monthlyChart: [
      { month: "Jun", earnings: 4200, subs: 2100 },
      { month: "Jul", earnings: 6100, subs: 2800 },
      { month: "Aug", earnings: 8400, subs: 3400 },
      { month: "Sep", earnings: 11200, subs: 4100 },
      { month: "Oct", earnings: 14800, subs: 4600 },
      { month: "Nov", earnings: netEarnings, subs: creator.subscriberCount || 4820 }
    ],
    topPosts: creatorPosts.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title,
      likes: p.likes,
      tipsTotal: p.tipsTotal,
      comments: p.commentsCount
    }))
  });
});

export default router;
