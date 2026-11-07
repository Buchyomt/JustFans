import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Lock, 
  Plus, 
  BarChart3, 
  CheckCircle2
} from 'lucide-react';

export default function CreatorStudioPage() {
  const { currentUser, authFetch, switchDemo } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  // New post state
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('video');
  const [isLocked, setIsLocked] = useState(true);
  const [price, setPrice] = useState('4.99');
  const [submitting, setSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await authFetch('/api/analytics/creator-studio');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load studio analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentUser]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setPublishSuccess(false);
    try {
      const res = await authFetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          caption,
          mediaUrl: mediaUrl || (mediaType === 'video'
            ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
            : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'),
          mediaType,
          isLocked,
          priceToUnlock: isLocked ? parseFloat(price) : 0,
          requiredTier: isLocked ? "Standard Fan" : "free"
        })
      });
      const data = await res.json();
      if (data.success) {
        setPublishSuccess(true);
        setTitle('');
        setCaption('');
        setMediaUrl('');
        fetchAnalytics();
      } else {
        alert(data.message || 'Publish failed');
      }
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131722] border border-[#1f2638] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={analytics?.creator?.avatar || currentUser?.avatar}
            alt="Creator"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8b5cf6]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Creator Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                PRO PARTNER
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Welcome back, <span className="text-white font-semibold">{analytics?.creator?.name}</span> · Real-time creator metrics & paywall manager
            </p>
          </div>
        </div>

        {currentUser?.role !== 'creator' && (
          <button
            onClick={() => switchDemo('creator-1')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Switch to Aria Nova (Creator View)
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Earnings */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            ${(analytics?.metrics?.totalEarnings || 74200).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% from last month</span>
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MRR (Subscriptions)</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-[#00aff0] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#00aff0]">
            ${(analytics?.metrics?.monthlyRecurringRevenue || 72250).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-2">Predictable monthly fan revenue</p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Subscribers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {(analytics?.metrics?.activeSubscribers || 4820).toLocaleString()}
          </p>
          <p className="text-xs text-purple-400 font-bold mt-2">{analytics?.metrics?.subscriberGrowthPercentage || '+18.4%'} new signups</p>
        </div>

        {/* Tips & PPV */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tips & PPV Unlocks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            ${((analytics?.metrics?.tipsEarnings || 1420) + (analytics?.metrics?.ppvEarnings || 3280)).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-2">Avg tip: ${analytics?.metrics?.avgTipAmount || '14.50'}</p>
        </div>

      </div>

      {/* Main Studio Grid: Post Composer & Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Post Composer Column */}
        <div className="lg:col-span-2 bg-[#131722] border border-[#1f2638] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#00aff0]/20 text-[#00aff0] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Publish New Video or Post</h2>
              <p className="text-xs text-gray-400">Upload high-res media and set your subscription or PPV paywall rules</p>
            </div>
          </div>

          {publishSuccess && (
            <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Post published successfully! It is now live on your channel and home feed.</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Post Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 40-Minute Upper Body Hypertrophy Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00aff0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Description / Caption
              </label>
              <textarea
                rows="3"
                placeholder="Explain the routine, workout splits, or audio session breakdown..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00aff0] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Format
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="video">High Definition Video (MP4)</option>
                  <option value="image">Photo / Artwork / Gallery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Media Direct URL
                </label>
                <input
                  type="url"
                  placeholder="https://... (or leave empty for test video)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                />
              </div>
            </div>

            {/* Paywall Controls */}
            <div className="p-4 bg-[#1a2133] rounded-2xl border border-[#2b354e] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00aff0]" />
                    <span>Monetize Content (Subscriber-Only & PPV)</span>
                  </p>
                  <p className="text-[11px] text-gray-400">Lock this post so non-subscribers must pay to view</p>
                </div>
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="w-5 h-5 accent-[#00aff0] cursor-pointer"
                />
              </div>

              {isLocked && (
                <div className="pt-2 border-t border-[#262c3d] flex items-center gap-3">
                  <span className="text-xs text-gray-300">Individual Pay-Per-View Price:</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#131722] border border-[#394663] rounded-xl pl-7 pr-3 py-1.5 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition cursor-pointer"
            >
              {submitting ? "Processing Upload..." : "Publish Post to JustFans Channel"}
            </button>
          </form>
        </div>

        {/* Monthly Earnings Chart / Table */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8b5cf6]" />
                <span>Monthly Trajectory</span>
              </h3>
              <span className="text-[11px] text-gray-400">H2 2026</span>
            </div>

            <div className="space-y-3">
              {analytics?.monthlyChart?.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300">{m.month}</span>
                    <span className="font-bold text-[#00aff0]">${m.earnings.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-[#0e121b] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] rounded-full"
                      style={{ width: `${Math.min(100, (m.earnings / 80000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Payout Box */}
          <div className="mt-6 p-4 bg-[#0e121b] border border-[#232b3e] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300">Next Auto-Payout</span>
              <span className="text-xs font-bold text-emerald-400">Nov 15, 2026</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">
              Direct deposit configured to verified business checking account (••4910).
            </p>
            <button className="w-full py-2 bg-[#1a2133] hover:bg-[#252f48] text-white text-xs font-bold rounded-xl border border-[#2b354e] transition">
              Manage Bank & Tax Forms
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
