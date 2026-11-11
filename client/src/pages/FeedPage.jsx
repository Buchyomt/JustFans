import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import TipModal from '../components/TipModal';
import SubscribeModal from '../components/SubscribeModal';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Users, 
  Lock,
  PlusCircle, 
  TrendingUp, 
  Flame, 
  CheckCircle2
} from 'lucide-react';

export default function FeedPage() {
  const { currentUser, isAuthenticated, authFetch } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [filter, setFilter] = useState('all'); // star, all, community, subscribed, video, image
  const [loading, setLoading] = useState(true);

  // Identify featured star creator (primary flagship brand)
  const starCreator = creators.find(c => c.id === 'creator-1') || creators[0];

  // Modals state
  const [activeTipPost, setActiveTipPost] = useState(null);
  const [activeSubCreator, setActiveSubCreator] = useState(null);

  // New post form state (for creator)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState('video');
  const [newIsLocked, setNewIsLocked] = useState(false);
  const [newPrice, setNewPrice] = useState('4.99');
  const [isPosting, setIsPosting] = useState(false);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      let url = '/api/posts';
      if (filter === 'star' && starCreator) {
        url += `?creatorId=${starCreator.id}`;
      } else if (filter === 'subscribed') {
        url += '?filter=subscribed';
      } else if (filter === 'video' || filter === 'image') {
        url += `?mediaType=${filter}`;
      }
      
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        let list = data.posts;
        if (filter === 'community' && starCreator) {
          list = list.filter(p => p.creatorId !== starCreator.id);
        }
        setPosts(list);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      if (data.success) {
        setCreators(data.creators);
      }
    } catch (err) {
      console.error('Failed to load creators:', err);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [filter, currentUser, creators.length]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/studio');
      return;
    }
    if (!newTitle.trim()) return;

    setIsPosting(true);
    try {
      const res = await authFetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          caption: newCaption,
          mediaUrl: newMediaUrl || (newMediaType === 'video' 
            ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' 
            : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'),
          mediaType: newMediaType,
          isLocked: newIsLocked,
          priceToUnlock: newIsLocked ? parseFloat(newPrice) : 0,
          requiredTier: newIsLocked ? "Standard Fan" : "free"
        })
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.post, ...posts]);
        setShowCreateModal(false);
        setNewTitle('');
        setNewCaption('');
        setNewMediaUrl('');
      } else {
        alert(data.message || 'Error creating post');
      }
    } catch (err) {
      console.error('Post creation failed:', err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main Feed Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Creator Stories / Avatars Rail */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-4 overflow-x-auto flex items-center gap-4 scrollbar-none shadow-lg">
          {creators.map((c) => (
            <Link
              key={c.id}
              to={`/creator/${c.username}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#00aff0] to-[#8b5cf6] group-hover:scale-105 transition-transform">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-full h-full rounded-full object-cover border-2 border-[#131722]"
                />
              </div>
              <span className="text-[11px] font-semibold text-gray-300 truncate max-w-[70px] text-center">
                {c.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>

        {/* Unauthenticated User Welcome Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-[#161c2b] via-[#1a2133] to-[#161c2b] border border-[#273148] rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#00aff0]" />
                <h3 className="font-extrabold text-white text-sm">Join the JustFans Network</h3>
              </div>
              <p className="text-xs text-gray-400">
                Sign in to follow creators, unlock exclusive 4K videos, send tips, or create a channel.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                to="/login"
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#1a2133] hover:bg-[#252f47] border border-[#2b354e] text-white font-bold text-xs rounded-xl text-center transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-extrabold text-xs rounded-xl text-center shadow-md transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Creator Post Trigger (if creator) or Upload Action CTA */}
        {currentUser?.role === 'creator' && (
          <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-4 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#00aff0]"
              />
              <div>
                <p className="text-xs font-bold text-white">Publish New Content</p>
                <p className="text-[11px] text-gray-400">Share video tutorials, behind-the-scenes, or paywalled media</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          </div>
        )}

        {/* Featured Star Creator Spotlight Card */}
        {starCreator && (
          <div className="bg-gradient-to-r from-[#141926] via-[#172033] to-[#141926] border border-[#26334d] rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <Link to={`/creator/${starCreator.username}`} className="relative group flex-shrink-0">
                  <img
                    src={starCreator.avatar}
                    alt={starCreator.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00aff0] shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow">
                    STAR
                  </span>
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm sm:text-base font-extrabold text-white truncate">{starCreator.name}</h2>
                    <CheckCircle2 className="w-4 h-4 text-[#00aff0] fill-[#00aff0]/20 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                      Featured Star
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">{starCreator.bio}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    <span className="text-white font-semibold">{starCreator.subscriberCount?.toLocaleString() || '4,820'}</span> subscribers · <span className="text-cyan-400 font-semibold">${starCreator.monthlyPrice || 14.99}</span>/mo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setFilter('star')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                    filter === 'star'
                      ? 'bg-[#00aff0] text-black shadow-md shadow-cyan-500/25'
                      : 'bg-[#1b2336] hover:bg-[#25304a] text-cyan-300 border border-[#2b3956]'
                  }`}
                >
                  ⭐ Star Feed
                </button>
                <Link
                  to={`/creator/${starCreator.username}`}
                  className="px-3.5 py-1.5 bg-[#1b2336] hover:bg-[#25304a] border border-[#2b3956] text-white font-bold text-xs rounded-xl transition"
                >
                  Channel
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Feed Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'star', label: '⭐ Star Channel', icon: Sparkles },
            { id: 'all', label: '🔥 All Creators', icon: Flame },
            { id: 'community', label: '🌐 Community', icon: Users },
            { id: 'video', label: '🎬 HD Videos', icon: Video },
            { id: 'subscribed', label: '🔒 Subscribed', icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border transition flex-shrink-0 cursor-pointer ${
                  active 
                    ? 'bg-[#00aff0] text-black border-[#00aff0] shadow-md shadow-cyan-500/20' 
                    : 'bg-[#131722] text-gray-400 border-[#1f2638] hover:text-white hover:border-[#2d374f]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Posts Stream */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-[#131722] border border-[#1f2638] rounded-3xl p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1f2638] rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#1f2638] rounded w-1/4"></div>
                    <div className="h-3 bg-[#1f2638] rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-64 bg-[#1f2638] rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-12 text-center">
            <Flame className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No posts in this filter</h4>
            <p className="text-xs text-gray-400 mb-4">Try switching filters or subscribe to creators to populate your personal feed.</p>
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 bg-[#00aff0] text-black font-bold text-xs rounded-xl cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onTip={(p) => setActiveTipPost(p)}
                onSubscribe={(c) => setActiveSubCreator(c)}
                onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))}
              />
            ))}
          </div>
        )}

      </div>

      {/* Right Column / Discover Sidebar */}
      <div className="hidden lg:block space-y-6">
        
        {/* Featured Creators Card */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00aff0]" />
              <span>Trending Creators</span>
            </h3>
            <Link to="/explore" className="text-xs text-[#00aff0] hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="space-y-3.5">
            {creators.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-[#1a2133] transition">
                <Link to={`/creator/${c.username}`} className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#00aff0]/40"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {c.name}
                      {c.verified && <CheckCircle2 className="w-3 h-3 text-[#00aff0]" />}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{c.category}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    if (!isAuthenticated) return navigate('/login');
                    setActiveSubCreator(c);
                  }}
                  className="px-3 py-1 bg-[#00aff0]/10 hover:bg-[#00aff0] hover:text-black text-[#00aff0] font-bold text-xs rounded-full border border-[#00aff0]/30 transition cursor-pointer"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Perks & Badges */}
        <div className="bg-gradient-to-br from-[#161c2b] to-[#1a172c] border border-[#273148] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Why Join JustFans</span>
          </div>
          <h4 className="font-extrabold text-white text-base mb-2">Support Creators Directly</h4>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            Enjoy uncompressed 4K video streams, private community channels, live form-check chats, and exclusive masterclasses.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-300">
            <div className="p-2.5 bg-[#0e121b]/60 rounded-xl border border-[#232b3e]">
              🔒 100% Secure PPV
            </div>
            <div className="p-2.5 bg-[#0e121b]/60 rounded-xl border border-[#232b3e]">
              ⚡ Instant 4K Streaming
            </div>
          </div>
        </div>

      </div>

      {/* Tip Modal */}
      {activeTipPost && (
        <TipModal
          post={activeTipPost}
          onClose={() => setActiveTipPost(null)}
          onTipSuccess={(amt) => {
            setPosts(posts.map(p => p.id === activeTipPost.id ? { ...p, tipsTotal: (p.tipsTotal || 0) + amt } : p));
          }}
        />
      )}

      {/* Subscribe Modal */}
      {activeSubCreator && (
        <SubscribeModal
          creator={activeSubCreator}
          onClose={() => setActiveSubCreator(null)}
          onSubscribeSuccess={() => {
            fetchFeed();
          }}
        />
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <h3 className="font-extrabold text-lg text-white mb-4">Create New Creator Post</h3>
            
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4K Leg Routine & Mobility Prep"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00aff0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Caption / Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe your workout, beat, or art process..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00aff0] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Media Type</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value)}
                    className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="video">Video</option>
                    <option value="image">Photo / Artwork</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Media Link (MP4/JPG)</label>
                  <input
                    type="url"
                    placeholder="https://... or leave blank for sample"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                  />
                </div>
              </div>

              {/* Paywall toggle */}
              <div className="p-3.5 bg-[#1a2133] rounded-2xl border border-[#2b354e] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00aff0]" />
                    <span>Lock Content Behind Paywall</span>
                  </p>
                  <p className="text-[11px] text-gray-400">Require subscription or Pay-Per-View unlock</p>
                </div>
                <input
                  type="checkbox"
                  checked={newIsLocked}
                  onChange={(e) => setNewIsLocked(e.target.checked)}
                  className="w-5 h-5 accent-[#00aff0] cursor-pointer"
                />
              </div>

              {newIsLocked && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Pay-Per-View Unlock Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-transparent text-gray-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2.5 bg-[#00aff0] text-black font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isPosting ? "Publishing..." : "Publish to Feed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
