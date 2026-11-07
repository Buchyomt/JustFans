import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import TipModal from '../components/TipModal';
import SubscribeModal from '../components/SubscribeModal';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const { currentUser, authFetch } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTipPost, setActiveTipPost] = useState(null);
  const [activeSubCreator, setActiveSubCreator] = useState(null);

  const fetchBookmarkedPosts = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/posts?filter=bookmarked');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarkedPosts();
  }, [currentUser]);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8 space-y-6">
      <div className="flex items-center gap-3 bg-[#131722] border border-[#1f2638] rounded-3xl p-6 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-[#00aff0]/20 text-[#00aff0] flex items-center justify-center">
          <Bookmark className="w-6 h-6 fill-[#00aff0]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Saved Posts & Workouts</h1>
          <p className="text-xs text-gray-400">Quickly access posts you have bookmarked for later</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-64 bg-[#131722] rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-12 text-center max-w-md mx-auto">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Saved Posts Yet</h4>
          <p className="text-xs text-gray-400">Click the bookmark icon on any post in the feed to save it here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onTip={p => setActiveTipPost(p)}
              onSubscribe={c => setActiveSubCreator(c)}
            />
          ))}
        </div>
      )}

      {activeTipPost && (
        <TipModal
          post={activeTipPost}
          onClose={() => setActiveTipPost(null)}
          onTipSuccess={amt => {
            setPosts(posts.map(p => p.id === activeTipPost.id ? { ...p, tipsTotal: (p.tipsTotal || 0) + amt } : p));
          }}
        />
      )}

      {activeSubCreator && (
        <SubscribeModal
          creator={activeSubCreator}
          onClose={() => setActiveSubCreator(null)}
          onSubscribeSuccess={() => {
            fetchBookmarkedPosts();
          }}
        />
      )}
    </div>
  );
}
