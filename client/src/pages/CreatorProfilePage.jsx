import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import TipModal from '../components/TipModal';
import SubscribeModal from '../components/SubscribeModal';
import { 
  CheckCircle2, 
  MessageSquare, 
  DollarSign, 
  Lock, 
  ArrowLeft
} from 'lucide-react';

export default function CreatorProfilePage() {
  const { username } = useParams();
  const { currentUser, isAuthenticated, authFetch } = useAuth();
  const navigate = useNavigate();
  
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, video, image, locked
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Modals
  const [activeTipPost, setActiveTipPost] = useState(null);
  const [showTipCreator, setShowTipCreator] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/creators/${username}`);
      const data = await res.json();
      if (data.success) {
        setCreator(data.creator);
        setPosts(data.posts);
        setIsFollowing(data.creator.isFollowing);
      }
    } catch (err) {
      console.error('Failed to load creator:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!creator) return;
    try {
      const res = await authFetch(`/api/creators/${creator.id}/follow`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 animate-pulse space-y-6">
        <div className="h-64 bg-[#131722] rounded-3xl"></div>
        <div className="h-32 bg-[#131722] rounded-3xl"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex-1 max-w-md mx-auto p-12 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Creator Not Found</h3>
        <p className="text-sm text-gray-400 mb-4">We couldn't find a channel for @{username}.</p>
        <Link to="/explore" className="px-4 py-2 bg-[#00aff0] text-black font-bold text-xs rounded-xl">
          Browse Creators
        </Link>
      </div>
    );
  }

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'video') return p.mediaType === 'video';
    if (activeTab === 'image') return p.mediaType === 'image';
    if (activeTab === 'locked') return p.isLocked;
    return true;
  });

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full pb-16">
      
      {/* Cover Banner */}
      <div className="relative h-56 sm:h-72 w-full bg-[#161c2b] overflow-hidden">
        <img
          src={creator.banner || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200"}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-black/30"></div>
        
        <Link 
          to="/explore"
          className="absolute top-4 left-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Profile Header Details */}
      <div className="px-4 sm:px-8 -mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          
          <div className="flex items-end gap-4">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-[#0b0e14] shadow-2xl"
            />
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-white">{creator.name}</h1>
                {creator.verified && (
                  <CheckCircle2 className="w-5 h-5 text-[#00aff0] fill-[#00aff0]/20" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                @{creator.username} · <span className="text-cyan-400 font-semibold">{creator.category}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleFollow}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isFollowing 
                  ? 'bg-transparent text-gray-300 border-[#2f3b54] hover:bg-[#1f283d]' 
                  : 'bg-[#1a2133] text-white border-[#2b354e] hover:border-gray-400'
              }`}
            >
              {isFollowing ? "Following" : "+ Follow"}
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) return navigate('/login');
                setShowTipCreator(true);
              }}
              className="px-4 py-2.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Send Tip</span>
            </button>

            <Link
              to={isAuthenticated ? `/messages?creator=${creator.id}` : '/login'}
              className="px-4 py-2.5 bg-[#1a2133] hover:bg-[#252f47] text-white border border-[#2b354e] rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-4 h-4 text-[#00aff0]" />
              <span>Chat / DM</span>
            </Link>

            <button
              onClick={() => {
                if (!isAuthenticated) return navigate('/login');
                setShowSubModal(true);
              }}
              className="px-5 py-2.5 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              {creator.isSubscribed ? "Manage Plan" : `Subscribe $${(creator.monthlyPrice || 9.99).toFixed(2)}/mo`}
            </button>
          </div>

        </div>

        {/* Bio */}
        <p className="text-sm text-gray-300 max-w-3xl leading-relaxed mb-6">
          {creator.bio}
        </p>

        {/* Channel Counters */}
        <div className="grid grid-cols-4 max-w-lg bg-[#131722] border border-[#1f2638] rounded-2xl p-3 text-center mb-8">
          <div>
            <p className="text-base font-black text-white">{(creator.subscriberCount || 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Subscribers</p>
          </div>
          <div>
            <p className="text-base font-black text-white">{posts.length}</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Posts</p>
          </div>
          <div>
            <p className="text-base font-black text-white">{((creator.likeCount || 1000) / 1000).toFixed(1)}k</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Likes</p>
          </div>
          <div>
            <p className="text-base font-black text-[#00aff0]">${(creator.monthlyPrice || 9.99).toFixed(2)}</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Per Month</p>
          </div>
        </div>

        {/* Subscription Tier Cards */}
        {creator.tiers && creator.tiers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
              Membership Tiers & Perks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creator.tiers.map((tier, idx) => (
                <div key={idx} className="bg-[#131722] border border-[#1f2638] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-white">{tier.name}</span>
                      <span className="text-lg font-black text-[#00aff0]">${tier.price.toFixed(2)}/mo</span>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {tier.perks.map((p, pIdx) => (
                        <li key={pIdx} className="text-xs text-gray-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00aff0] mt-0.5 flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowSubModal(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Unlock {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1f2638] pb-4 mb-6">
          {[
            { id: 'all', label: `All Posts (${posts.length})` },
            { id: 'video', label: 'Videos' },
            { id: 'image', label: 'Photos' },
            { id: 'locked', label: 'Subscribers Only' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1e2538] text-[#00aff0] border border-[#00aff0]/40'
                  : 'text-gray-400 hover:text-white hover:bg-[#131722]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Stream */}
        {filteredPosts.length === 0 ? (
          <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-10 text-center">
            <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No posts under this filter</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, creator }}
                onTip={(p) => setActiveTipPost(p)}
                onSubscribe={() => setShowSubModal(true)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Tip Modal */}
      {(activeTipPost || showTipCreator) && (
        <TipModal
          post={activeTipPost}
          creator={creator}
          onClose={() => { setActiveTipPost(null); setShowTipCreator(false); }}
          onTipSuccess={() => {
            fetchCreatorProfile();
          }}
        />
      )}

      {/* Subscribe Modal */}
      {showSubModal && (
        <SubscribeModal
          creator={creator}
          onClose={() => setShowSubModal(false)}
          onSubscribeSuccess={() => {
            fetchCreatorProfile();
          }}
        />
      )}

    </div>
  );
}
