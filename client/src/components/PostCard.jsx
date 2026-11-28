import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { extractVideoFrames, formatVideoTime } from '../utils/videoThumbnails';
import { getVideoFromLocalCache } from '../utils/videoStorage';
import { 
  Heart, 
  MessageCircle, 
  DollarSign, 
  Bookmark, 
  Lock, 
  CheckCircle2, 
  Send, 
  Sparkles,
  Trash2,
  Share2,
  Check,
  Pencil,
  Upload,
  X,
  Video,
  FileVideo,
  Film
} from 'lucide-react';

const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80"
];

export const getPostCover = (post) => {
  if (post?.thumbnail && !post.thumbnail.match(/\.(mp4|mov|webm|mkv|m4v)($|\?)/i) && post.thumbnail !== '/FhNtifmVQAEZDgwy.jpg') {
    return post.thumbnail;
  }
  const seed = (post?.id || post?.title || 'post').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_COVERS[Math.abs(seed) % DEFAULT_COVERS.length];
};

export default function PostCard({ post, onTip, onSubscribe, onDelete }) {
  const { currentUser, isAuthenticated, authFetch, updateBalance } = useAuth();
  const navigate = useNavigate();

  const [postData, setPostData] = useState(post);
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.isBookmarked));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(post.hasAccess);
  const [unlocking, setUnlocking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [videoSrc, setVideoSrc] = useState(post.mediaUrl);

  // Edit Post Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editMediaUrl, setEditMediaUrl] = useState(post.mediaUrl || '');
  const [editThumbnail, setEditThumbnail] = useState(getPostCover(post));
  const [editPrice, setEditPrice] = useState(post.priceToUnlock?.toString() || '18.66');
  const [editIsLocked, setEditIsLocked] = useState(Boolean(post.isLocked));
  const [editExtractedFrames, setEditExtractedFrames] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // Sync state if post prop updates
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      if (post.mediaUrl) {
        let cached = await getVideoFromLocalCache(post.mediaUrl);
        if (!cached && post.id) {
          cached = await getVideoFromLocalCache(post.id);
        }
        if (cached && isMounted) {
          setVideoSrc(cached);
          return;
        }
        if (window.__localVideoBlobs && window.__localVideoBlobs[post.mediaUrl] && isMounted) {
          setVideoSrc(window.__localVideoBlobs[post.mediaUrl]);
          return;
        }
      }
      if (isMounted) {
        setVideoSrc(post.mediaUrl || '');
      }
    })();

    setPostData(post);
    setEditTitle(post.title);
    setEditCaption(post.caption || '');
    setEditMediaUrl(post.mediaUrl || '');
    setEditThumbnail(getPostCover(post));
    setEditIsLocked(Boolean(post.isLocked));
    setEditPrice(post.priceToUnlock?.toString() || '18.66');
    setLikes(post.likes || 0);
    setIsLiked(Boolean(post.isLiked));
    setIsUnlocked(post.hasAccess);
    setIsBookmarked(Boolean(post.isBookmarked));
    setComments(post.comments || []);
    return () => { isMounted = false; };
  }, [post]);

  const requireLoginPrompt = () => {
    navigate('/signup?redirect=' + encodeURIComponent(window.location.pathname));
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/creator/${postData.creator?.username || 'uni_ques78'}`;
    navigator.clipboard?.writeText(postUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleLike = async () => {
    if (!isAuthenticated) return requireLoginPrompt();
    try {
      const res = await authFetch(`/api/posts/${postData.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLikes(data.likes);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return requireLoginPrompt();
    try {
      const res = await authFetch(`/api/posts/${postData.id}/bookmark`, { method: 'POST' });
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

    setIsSubmittingComment(true);
    try {
      const res = await authFetch(`/api/posts/${postData.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        setShowComments(true); // Open drawer so user sees their comment immediately
      }
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUnlockPost = async () => {
    if (!isAuthenticated) return requireLoginPrompt();
    setUnlocking(true);
    try {
      const res = await authFetch(`/api/posts/${postData.id}/unlock`, { method: 'POST' });
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
    onTip(postData);
  };

  const handleSubscribeClick = () => {
    if (!isAuthenticated) return requireLoginPrompt();
    onSubscribe(postData.creator);
  };

  const isOwner = currentUser && (
    currentUser.id === postData.creatorId || 
    currentUser.id === postData.creator?.id || 
    currentUser.role === 'admin'
  );

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await authFetch(`/api/posts/${postData.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setShowDeleteModal(false);
        if (onDelete) onDelete(postData.id);
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting post.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Upload a replacement video file from disk
  const handleUploadReplacementVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadMessage('Uploading replacement video to server...');
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await authFetch('/api/videos/upload-file', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.videoUrl) {
        setEditMediaUrl(data.videoUrl);
        setUploadMessage(`✓ Successfully uploaded: ${file.name}`);
        
        // Extract real frames from uploaded video
        try {
          const frames = await extractVideoFrames(file, 6);
          if (frames && frames.length > 0) {
            setEditExtractedFrames(frames);
            setEditThumbnail(frames[0].dataUrl);
          }
        } catch (frameErr) {
          console.warn('Frame capture notice:', frameErr);
        }
      } else {
        setUploadMessage(data.message || 'Upload failed');
      }
    } catch {
      setUploadMessage('Upload network error.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Save edited post
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await authFetch(`/api/posts/${postData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          caption: editCaption.trim(),
          mediaUrl: editMediaUrl.trim(),
          thumbnail: editThumbnail,
          isLocked: editIsLocked,
          priceToUnlock: editIsLocked ? parseFloat(editPrice) || 0 : 0
        })
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPostData(data.post);
        setIsEditing(false);
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Edit error:', err);
      alert('Failed to update post.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <>
      <article className="bg-[#131722] border border-[#1f2638] rounded-3xl overflow-hidden shadow-xl hover:border-[#2b354d] transition-all">
        
        {/* Post Header: Creator Info & Owner Actions */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <Link 
            to={`/creator/${postData.creator?.username || postData.creatorId}`} 
            className="flex items-center gap-3 group"
          >
            <img
              src={postData.creator?.avatar || "/FhNtifmVQAEZDgwy.jpg"}
              alt={postData.creator?.name || "Creator"}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#00aff0]/60 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#00aff0] transition-colors">
                  {postData.creator?.name || "Nicole Shayla"}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-[#00aff0] fill-[#00aff0]/20 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-400">
                @{postData.creator?.username || "uni_ques78"} · <span className="text-gray-500">{new Date(postData.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(postData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit post & replace video"
                  className="px-2.5 py-1.5 text-xs font-bold text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  title="Delete post"
                  className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {postData.creator && !isOwner && (
              <button
                onClick={handleSubscribeClick}
                className="text-xs font-bold text-[#00aff0] bg-[#00aff0]/10 hover:bg-[#00aff0]/20 border border-[#00aff0]/30 px-3.5 py-1.5 rounded-full transition cursor-pointer"
              >
                {postData.isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
        </div>

        {/* Post Text / Title */}
        <div className="px-4 sm:px-5 pb-3">
          <h4 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
            {postData.title}
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {postData.caption}
          </p>
          {postData.tags && postData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {postData.tags.map((tag, idx) => (
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
            postData.mediaType === 'video' ? (
              <div className="relative aspect-video w-full bg-black flex items-center justify-center group/video">
                <video
                  src={videoSrc || postData.mediaUrl || "https://vjs.zencdn.net/v/oceans.mp4"}
                  controls
                  playsInline
                  preload="metadata"
                  poster={getPostCover(postData)}
                  className="w-full h-full object-contain bg-black"
                  onError={() => {
                    if (videoSrc !== "https://vjs.zencdn.net/v/oceans.mp4") {
                      setVideoSrc("https://vjs.zencdn.net/v/oceans.mp4");
                    }
                  }}
                >
                  Your browser does not support HTML5 video.
                </video>

                {/* Anti-Leak Dynamic Watermark Overlay */}
                <div className="absolute top-2.5 right-3 pointer-events-none select-none z-10 opacity-40 group-hover/video:opacity-75 transition-opacity">
                  <div className="bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-gray-200 tracking-wider flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0] animate-pulse"></span>
                    <span>{currentUser?.username ? `@${currentUser.username}` : 'JustFans VIP Vault'} · 4K Protected</span>
                  </div>
                </div>

                {/* Subdued Authenticity Seal */}
                <div className="absolute bottom-12 left-3 pointer-events-none select-none z-10 opacity-25 text-[9px] font-mono text-white tracking-widest uppercase">
                  JustFans 4K Vault · {postData.creator?.name || 'Nicole Shayla'} Official
                </div>
              </div>
            ) : (
              <div className="relative max-h-[550px] w-full flex items-center justify-center bg-[#090b10]">
                <img
                  src={postData.mediaUrl}
                  alt={postData.title}
                  className="w-full h-auto max-h-[550px] object-cover"
                />
              </div>
            )
          ) : (
            /* Locked Paywall State */
            <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden">
              <img
                src={getPostCover(postData)}
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
                  Join <span className="text-white font-semibold">{postData.creator?.name || "Nicole Shayla"}</span>'s VIP channel or unlock this single post to watch now.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubscribeClick}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-extrabold text-xs rounded-full shadow-lg transition cursor-pointer"
                  >
                    Subscribe for ${(postData.creator?.monthlyPrice || 60).toFixed(2)}/mo
                  </button>
                  {postData.priceToUnlock > 0 && (
                    <button
                      type="button"
                      disabled={unlocking}
                      onClick={handleUnlockPost}
                      className="px-5 py-2.5 bg-[#1f2638] hover:bg-[#2b354d] text-white border border-[#394663] font-bold text-xs rounded-full transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{unlocking ? "Unlocking..." : `Unlock Post for $${postData.priceToUnlock.toFixed(2)}`}</span>
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
              
              {/* Like Button */}
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
                className={`flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer ${
                  showComments ? 'text-[#00aff0]' : 'text-gray-400 hover:text-[#00aff0]'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length} Comments</span>
              </button>

              {/* Tip Button */}
              <button
                onClick={handleTipClick}
                className="flex items-center gap-1 text-sm font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30 transition cursor-pointer"
              >
                <DollarSign className="w-4 h-4 -mr-1" />
                <span>Tip</span>
                {postData.tipsTotal > 0 && (
                  <span className="text-xs text-amber-300 font-normal">(${postData.tipsTotal})</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Share */}
              <button
                onClick={handleShare}
                title="Copy share link"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1a2133] transition cursor-pointer"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span className="text-[11px] text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Share</span>
                  </>
                )}
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                title="Bookmark post"
                className={`p-2 rounded-full transition cursor-pointer ${
                  isBookmarked ? 'text-[#00aff0] bg-[#00aff0]/15' : 'text-gray-400 hover:text-white hover:bg-[#1a2133]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#00aff0]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Comment Bar (Always accessible for easy fan engagement) */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1f2638]">
            <input
              type="text"
              placeholder={isAuthenticated ? "Write a comment for Nicole..." : "Log in to join the conversation"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-[#0e121b] border border-[#273148] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00aff0] transition"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] hover:opacity-90 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post</span>
            </button>
          </form>

          {/* Full Comments List Drawer */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-[#1f2638]/50 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="font-bold">Fan Comments ({comments.length})</span>
                <button
                  type="button"
                  onClick={() => setShowComments(false)}
                  className="text-[11px] text-gray-500 hover:text-gray-300"
                >
                  Hide
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3 bg-[#0e121b]/40 rounded-xl">
                    No comments yet. Be the first to leave a supportive message!
                  </p>
                ) : (
                  comments.map((c, i) => (
                    <div key={c.id || i} className="flex items-start gap-2.5 bg-[#0e121b]/70 p-2.5 rounded-xl border border-[#1f2638]/60">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00aff0] to-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {c.user?.[0]?.toUpperCase() || 'F'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-200">@{c.user}</span>
                          <span className="text-[10px] text-gray-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </article>

      {/* Edit Post & Video Replacement Modal (Creator Only) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-[#131722] border border-[#2b354e] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative my-auto space-y-4">
            
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-[#1f2638] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-[#222b3e]">
              <Pencil className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-extrabold text-white text-base">Edit Post & Video</h3>
                <p className="text-xs text-gray-400">Update video file, title, caption, or pricing</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Caption / Description</label>
                <textarea
                  rows="3"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0] resize-none"
                />
              </div>

              {/* Video File Upload & Replacement */}
              <div className="p-3 bg-[#0e121b] border border-[#252f44] rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <FileVideo className="w-4 h-4" />
                  <span>Replace Video Media</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 bg-[#1e273b] hover:bg-[#28344e] border border-[#2d3a56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{uploadingFile ? "Uploading..." : "Upload New Video (.mp4, .mov)"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={uploadingFile}
                      onChange={handleUploadReplacementVideo}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadMessage && (
                  <p className="text-[11px] text-cyan-300 font-semibold">{uploadMessage}</p>
                )}

                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Or Direct Video URL:</span>
                  <input
                    type="text"
                    value={editMediaUrl}
                    onChange={(e) => setEditMediaUrl(e.target.value)}
                    placeholder="https://... or /uploads/videos/..."
                    className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3 py-1.5 text-xs text-gray-300 mt-1 focus:outline-none focus:border-[#00aff0] font-mono"
                  />
                </div>
              </div>

              {/* Teaser Cover / Thumbnail Selector */}
              <div className="p-3 bg-[#0e121b] border border-[#252f44] rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-pink-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Teaser Cover (Picked from Video)</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">Click frame or preset</span>
                </label>

                {editExtractedFrames.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-cyan-300 block">Frames Captured from Video:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {editExtractedFrames.map((frame, idx) => (
                        <div
                          key={idx}
                          onClick={() => setEditThumbnail(frame.dataUrl)}
                          className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                            editThumbnail === frame.dataUrl ? 'border-[#00aff0] scale-105 shadow-md shadow-cyan-500/20' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={frame.dataUrl} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 text-[8px] text-white rounded">
                            {frame.timeFormatted}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {DEFAULT_COVERS.slice(0, 4).map((cUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setEditThumbnail(cUrl)}
                      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                        editThumbnail === cUrl ? 'border-[#00aff0] scale-105 shadow-md shadow-cyan-500/20' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={cUrl} alt={`Cover ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={editThumbnail.startsWith('data:image/') ? '' : editThumbnail}
                  onChange={(e) => setEditThumbnail(e.target.value)}
                  placeholder="https://... cover image URL"
                  className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3 py-1.5 text-xs text-gray-300 mt-1 focus:outline-none focus:border-[#00aff0] font-mono"
                />
              </div>

              {/* Paywall & Price */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Access Type</label>
                  <select
                    value={editIsLocked ? "locked" : "free"}
                    onChange={(e) => setEditIsLocked(e.target.value === "locked")}
                    className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                  >
                    <option value="locked">🔒 Subscribers Only (Paywalled)</option>
                    <option value="free">🔓 Free Preview (Public)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Single Unlock Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!editIsLocked}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00aff0] disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222b3e]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-[#1a2133] hover:bg-[#232c44] text-gray-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || uploadingFile}
                  className="px-5 py-2 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  {isSavingEdit ? "Saving..." : "Save Post Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
      {/* Professional Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post Permanently?"
        itemName={postData.title}
        itemType="post"
        isLoading={isDeleting}
      />
    </>
  );
}
