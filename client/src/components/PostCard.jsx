import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  DollarSign, 
  Bookmark, 
  Lock, 
  CheckCircle2, 
  Send, 
  Sparkles,
  Trash2
} from 'lucide-react';

export default function PostCard({ post, onTip, onSubscribe, onDelete }) {
  const { currentUser, isAuthenticated, authFetch, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.isBookmarked));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(post.hasAccess);
  const [unlocking, setUnlocking] = useState(false);

  const requireLoginPrompt = () => {
    navigate('/signup?redirect=' + encodeURIComponent(window.location.pathname));
  };

  const handleLike = async () => {
    if (!isAuthenticated) return requireLoginPrompt();
    try {
      const res = await authFetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLikes(data.likes);
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return requireLoginPrompt();
    try {
      const res = await authFetch(`/api/posts/${post.id}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return requireLoginPrompt();
    if (!commentText.trim()) return;

    try {
      const res = await authFetch(`/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.comment]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleUnlockPost = async () => {
    if (!isAuthenticated) return requireLoginPrompt();
    setUnlocking(true);
    try {
      const res = await authFetch(`/api/posts/${post.id}/unlock`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsUnlocked(true);
        updateBalance(data.newBalance);
      } else {
        alert(data.message || 'Unlock failed');
      }
    } catch (err) {
      console.error('Unlock failed:', err);
    } finally {
      setUnlocking(false);
    }
  };

  const handleTipClick = () => {
    if (!isAuthenticated) return requireLoginPrompt();
    onTip(post);
  };

  const handleSubscribeClick = () => {
    if (!isAuthenticated) return requireLoginPrompt();
    onSubscribe(post.creator);
  };

  const isOwner = currentUser && (currentUser.id === post.creatorId || currentUser.id === post.creator?.id || currentUser.role === 'admin');

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      const res = await authFetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onDelete) onDelete(post.id);
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post.');
    }
  };

  return (
    <article className="bg-[#131722] border border-[#1f2638] rounded-3xl overflow-hidden shadow-xl hover:border-[#2b354d] transition-all">
      
      {/* Post Header: Creator Info */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <Link 
          to={`/creator/${post.creator?.username || post.creatorId}`} 
          className="flex items-center gap-3 group"
        >
          <img
            src={post.creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
            alt={post.creator?.name || "Creator"}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#00aff0]/60 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#00aff0] transition-colors">
                {post.creator?.name || "Featured Creator"}
              </h3>
              {post.creator?.verified && (
                <CheckCircle2 className="w-4 h-4 text-[#00aff0] fill-[#00aff0]/20" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              @{post.creator?.username || "creator"} · <span className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete post"
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {post.creator && !isOwner && (
            <button
              onClick={handleSubscribeClick}
              className="text-xs font-bold text-[#00aff0] bg-[#00aff0]/10 hover:bg-[#00aff0]/20 border border-[#00aff0]/30 px-3.5 py-1.5 rounded-full transition cursor-pointer"
            >
              {post.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      {/* Post Text / Title */}
      <div className="px-4 sm:px-5 pb-3">
        <h4 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
          {post.title}
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {post.caption}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="text-xs font-medium text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-800/30">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Media: Unlocked vs Locked PPV Teaser */}
      <div className="relative bg-black w-full overflow-hidden border-y border-[#1f2638]">
        {isUnlocked ? (
          post.mediaType === 'video' ? (
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <video
                src={post.mediaUrl}
                controls
                playsInline
                preload="metadata"
                poster={post.thumbnail}
                className="w-full h-full object-contain bg-black"
              >
                <source src={post.mediaUrl} />
                Your browser does not support HTML5 video.
              </video>
            </div>
          ) : (
            <div className="relative max-h-[550px] w-full flex items-center justify-center bg-[#090b10]">
              <img
                src={post.mediaUrl}
                alt={post.title}
                className="w-full h-auto max-h-[550px] object-cover"
              />
            </div>
          )
        ) : (
          /* Locked Paywall State */
          <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden">
            <img
              src={post.thumbnail || "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"}
              alt="Locked preview"
              className="w-full h-full object-cover filter blur-xl scale-110 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00aff0] to-[#8b5cf6] p-0.5 mb-3 shadow-xl shadow-cyan-500/25">
                <div className="w-full h-full bg-[#131722] rounded-[14px] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#00aff0]" />
                </div>
              </div>
              <h5 className="text-lg font-bold text-white mb-1">Subscriber Exclusive Video</h5>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                Join <span className="text-white font-semibold">{post.creator?.name}</span>'s membership or unlock this individual post to watch immediately.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleSubscribeClick}
                  className="px-5 py-2.5 bg-[#00aff0] hover:bg-[#0094cc] text-black font-bold text-xs rounded-full shadow-lg transition cursor-pointer"
                >
                  Subscribe for ${(post.creator?.monthlyPrice || 9.99).toFixed(2)}/mo
                </button>
                {post.priceToUnlock > 0 && (
                  <button
                    type="button"
                    disabled={unlocking}
                    onClick={handleUnlockPost}
                    className="px-5 py-2.5 bg-[#1f2638] hover:bg-[#2b354d] text-white border border-[#394663] font-bold text-xs rounded-full transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{unlocking ? "Unlocking..." : `Unlock Post for $${post.priceToUnlock.toFixed(2)}`}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Actions & Engagements */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer ${
                isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span>{likes}</span>
            </button>

            {/* Comment Drawer Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-[#00aff0] transition cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length}</span>
            </button>

            {/* Tip Button */}
            <button
              onClick={handleTipClick}
              className="flex items-center gap-1 text-sm font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30 transition cursor-pointer"
            >
              <DollarSign className="w-4 h-4 -mr-1" />
              <span>Tip</span>
              {post.tipsTotal > 0 && (
                <span className="text-xs text-amber-300 font-normal">(${post.tipsTotal})</span>
              )}
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition cursor-pointer ${
              isBookmarked ? 'text-[#00aff0] bg-[#00aff0]/15' : 'text-gray-400 hover:text-white hover:bg-[#1a2133]'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#00aff0]' : ''}`} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#1f2638] space-y-3">
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No comments yet. Be the first!</p>
              ) : (
                comments.map((c, i) => (
                  <div key={c.id || i} className="flex items-start gap-2.5 bg-[#0e121b]/60 p-2.5 rounded-xl border border-[#1f2638]/50">
                    <div className="w-6 h-6 rounded-full bg-[#00aff0]/20 text-[#00aff0] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {c.user?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-200">@{c.user}</span>
                        <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder={isAuthenticated ? "Write a supportive comment..." : "Log in to post a comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-[#0e121b] border border-[#273148] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00aff0]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3.5 py-2 bg-[#00aff0] disabled:opacity-40 text-black font-bold text-xs rounded-xl flex items-center justify-center transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

    </article>
  );
}
