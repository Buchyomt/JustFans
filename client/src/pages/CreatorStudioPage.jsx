import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { extractVideoFrames, extractSingleFrameAtTime, formatVideoTime } from '../utils/videoThumbnails';
import { saveVideoToLocalCache, getVideoFromLocalCache } from '../utils/videoStorage';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Lock, 
  Plus, 
  BarChart3, 
  CheckCircle2,
  Upload,
  Film,
  Video as VideoIcon,
  X,
  Play,
  Trash2,
  Camera,
  Check,
  Copy,
  KeyRound,
  UserCheck,
  Shield
} from 'lucide-react';

const TEASER_PRESETS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80"
];

export default function CreatorStudioPage() {
  const { currentUser, authFetch, refreshUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewResolvedSrc, setPreviewResolvedSrc] = useState('');

  useEffect(() => {
    if (!previewVideo) {
      setPreviewResolvedSrc('');
      return;
    }
    let isMounted = true;
    (async () => {
      const cached = await getVideoFromLocalCache(previewVideo.videoUrl);
      if (cached && isMounted) {
        setPreviewResolvedSrc(cached);
        return;
      }
      if (window.__localVideoBlobs && window.__localVideoBlobs[previewVideo.videoUrl] && isMounted) {
        setPreviewResolvedSrc(window.__localVideoBlobs[previewVideo.videoUrl]);
        return;
      }
      if (isMounted) {
        setPreviewResolvedSrc(previewVideo.videoUrl || "https://vjs.zencdn.net/v/oceans.mp4");
      }
    })();
    return () => { isMounted = false; };
  }, [previewVideo]);

  // New post / video state
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('video');
  const [customThumbnail, setCustomThumbnail] = useState(TEASER_PRESETS[0]);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [scrubberTime, setScrubberTime] = useState(1);
  const [isLocked, setIsLocked] = useState(true);
  const [price, setPrice] = useState('18.66');
  
  // Real video file upload state
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'

  const [submitting, setSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('composer'); // 'composer', 'videos', or 'subscribers'
  const [grantUsername, setGrantUsername] = useState('');
  const [grantMsg, setGrantMsg] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);

  // VIP Codes & Subscribers List states
  const [vipCodes, setVipCodes] = useState([]);
  const [subscribersList, setSubscribersList] = useState([]);
  const [deleteTargetVideo, setDeleteTargetVideo] = useState(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [customNewCode, setCustomNewCode] = useState('');
  const [newCodeTier, setNewCodeTier] = useState('Standard Fan');
  const [newCodePrice, setNewCodePrice] = useState('60.00');
  const [newCodeNote, setNewCodeNote] = useState('');
  const [codeGenerating, setCodeGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const fetchVipCodes = async () => {
    try {
      const res = await authFetch('/api/subscriptions/vip-codes');
      const data = await res.json();
      if (data.success && data.codes) setVipCodes(data.codes);
    } catch (e) {
      console.warn('Failed to load VIP codes:', e);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await authFetch('/api/subscriptions/subscribers');
      const data = await res.json();
      if (data.success && data.subscribers) setSubscribersList(data.subscribers);
    } catch (e) {
      console.warn('Failed to load subscribers:', e);
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setCodeGenerating(true);
    try {
      const res = await authFetch('/api/subscriptions/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customCode: customNewCode.trim(),
          tier: newCodeTier,
          price: parseFloat(newCodePrice) || 60.00,
          note: newCodeNote.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.code) {
        setVipCodes(prev => [data.code, ...prev]);
        setCustomNewCode('');
        setNewCodeNote('');
      } else {
        alert(data.message || 'Failed to generate VIP code');
      }
    } catch {
      alert('Network error generating VIP code');
    } finally {
      setCodeGenerating(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

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

  const fetchUploadedVideos = async () => {
    try {
      const res = await authFetch('/api/videos');
      const data = await res.json();
      if (data.success) {
        setUploadedVideos(data.videos);
      }
    } catch (err) {
      console.error('Failed to load uploaded videos:', err);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!grantUsername.trim()) return;
    setGrantLoading(true);
    setGrantMsg('');
    try {
      const res = await authFetch('/api/subscriptions/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanId: grantUsername.trim(),
          creatorId: currentUser?.id || 'creator-1',
          tierName: 'Standard Fan'
        })
      });
      const data = await res.json();
      if (data.success) {
        setGrantMsg(data.message || 'VIP Access granted successfully!');
        setGrantUsername('');
        fetchAnalytics();
      } else {
        setGrantMsg(data.message || 'Failed to grant VIP access');
      }
    } catch (err) {
      setGrantMsg('Network error granting VIP access');
    } finally {
      setGrantLoading(false);
    }
  };

  const handleConfirmDeleteVideo = async () => {
    if (!deleteTargetVideo) return;
    setIsDeletingVideo(true);
    try {
      const res = await authFetch(`/api/videos/${deleteTargetVideo.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUploadedVideos(prev => prev.filter(v => v.id !== deleteTargetVideo.id));
        if (previewVideo?.id === deleteTargetVideo.id) setPreviewVideo(null);
        fetchAnalytics();
        setDeleteTargetVideo(null);
      } else {
        alert(data.message || 'Failed to delete video');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting video.');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await authFetch('/api/creators/avatar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Profile picture updated successfully!');
        fetchAnalytics();
        if (refreshUser) refreshUser();
      } else {
        alert(data.message || 'Failed to update avatar');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUploadedVideos();
    fetchVipCodes();
    fetchSubscribers();
  }, [currentUser]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/x-matroska'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|mkv|m4v)$/i)) {
        alert('Please choose a valid video file format (MP4, MOV, WebM).');
        return;
      }
      setSelectedVideoFile(file);
      if (!title) {
        // Auto-populate title with clean filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      // Automatically extract real video frames directly from this uploaded video!
      setIsExtractingFrames(true);
      try {
        const frames = await extractVideoFrames(file, 6);
        if (frames && frames.length > 0) {
          setExtractedFrames(frames);
          // Default to the first captured video frame!
          setCustomThumbnail(frames[0].dataUrl);
        }
      } catch (frameErr) {
        console.warn('Frame capture notice:', frameErr);
      } finally {
        setIsExtractingFrames(false);
      }
    }
  };

  const handleScrubFrame = async (newTime) => {
    setScrubberTime(newTime);
    if (!selectedVideoFile) return;
    const snap = await extractSingleFrameAtTime(selectedVideoFile, newTime);
    if (snap && snap.dataUrl) {
      setCustomThumbnail(snap.dataUrl);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setPublishSuccess(false);

    try {
      const activeThumbnail = customThumbnail || TEASER_PRESETS[Math.floor(Math.random() * TEASER_PRESETS.length)];

      if (mediaType === 'video' && selectedVideoFile) {
        // Multipart/form-data upload to POST /api/videos
        const formData = new FormData();
        formData.append('video', selectedVideoFile);
        formData.append('title', title);
        formData.append('description', caption);
        formData.append('thumbnail', activeThumbnail);
        formData.append('isLocked', isLocked);
        formData.append('priceToUnlock', price);

        const res = await authFetch('/api/videos', {
          method: 'POST',
          body: formData
          // Note: Browser automatically sets Content-Type with boundary for FormData
        });
        const data = await res.json();
        if (data.success) {
          if (data.video?.videoUrl && selectedVideoFile) {
            try {
              window.__localVideoBlobs = window.__localVideoBlobs || {};
              window.__localVideoBlobs[data.video.videoUrl] = URL.createObjectURL(selectedVideoFile);
              await saveVideoToLocalCache(data.video.videoUrl, selectedVideoFile);
              if (data.video.id) {
                await saveVideoToLocalCache(data.video.id, selectedVideoFile);
              }
            } catch (blobErr) {
              console.warn('Local blob caching notice:', blobErr);
            }
          }
          setPublishSuccess(true);
          setTitle('');
          setCaption('');
          setSelectedVideoFile(null);
          setMediaUrl('');
          fetchAnalytics();
          fetchUploadedVideos();
        } else {
          alert(data.message || 'Video upload failed');
        }
      } else {
        // Standard post publisher
        const res = await authFetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            caption,
            mediaUrl: mediaUrl || (mediaType === 'video'
              ? 'https://vjs.zencdn.net/v/oceans.mp4'
              : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'),
            thumbnail: activeThumbnail,
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
          setSelectedVideoFile(null);
          fetchAnalytics();
        } else {
          alert(data.message || 'Publish failed');
        }
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
          <div className="relative group cursor-pointer" title="Click to upload profile photo">
            <img
              src={analytics?.creator?.avatar || currentUser?.avatar}
              alt="Creator"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 group-hover:opacity-75 transition"
            />
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
              <span className="text-[9px] text-white font-bold mt-0.5">Edit</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Creator Studio & Video Storage</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                PRO PARTNER
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Welcome back, <span className="text-white font-semibold">{analytics?.creator?.name}</span> · Real-time earnings, 4K video uploads & paywall manager
            </p>
          </div>
        </div>
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
          <p className="text-xs text-gray-400 mt-2">Predictable monthly recurring revenue</p>
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

        {/* Uploaded Videos Count */}
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Video Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            {uploadedVideos.length} Videos
          </p>
          <p className="text-xs text-gray-400 mt-2">Active hosted videos in catalog</p>
        </div>

      </div>

      {/* Main Studio Grid: Post & Video Composer / Video Library */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Composer */}
        <div className="lg:col-span-2 bg-[#131722] border border-[#1f2638] rounded-3xl p-6 shadow-xl">
          
          {/* Tabs */}
          <div className="flex items-center justify-between gap-3 mb-5 border-b border-[#1f2638] pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('composer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'composer' 
                    ? 'bg-[#00aff0] text-black shadow-md shadow-cyan-500/20' 
                    : 'text-gray-400 hover:text-white bg-[#1a2133]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Video or Post</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'videos' 
                    ? 'bg-[#00aff0] text-black shadow-md shadow-cyan-500/20' 
                    : 'text-gray-400 hover:text-white bg-[#1a2133]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Video Catalog ({uploadedVideos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'subscribers' 
                    ? 'bg-[#00aff0] text-black shadow-md shadow-cyan-500/20' 
                    : 'text-gray-400 hover:text-white bg-[#1a2133]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>VIP Access & Codes</span>
              </button>
            </div>
          </div>

          {activeTab === 'composer' ? (
            <>
              {publishSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Video stored and published successfully! It is now accessible via <code>/api/videos</code> and live in your channel feed.</span>
                </div>
              )}

              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Video / Post Title
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

                {/* Media Format Picker */}
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
                      <option value="video">High Definition Video (Multer Storage / MP4 / MOV / WebM)</option>
                      <option value="image">Photo / Artwork / Gallery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Source
                    </label>
                    <div className="flex rounded-xl bg-[#1a2133] p-1 border border-[#2b354e]">
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${uploadMode === 'file' ? 'bg-[#00aff0] text-black' : 'text-gray-400'}`}
                      >
                        Upload Local File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${uploadMode === 'url' ? 'bg-[#00aff0] text-black' : 'text-gray-400'}`}
                      >
                        External URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video File Drag & Drop / Input */}
                {mediaType === 'video' && uploadMode === 'file' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Select Video File (Multer Handler: MP4, MOV, WebM · Max 1GB)
                    </label>
                    
                    {selectedVideoFile ? (
                      <div className="p-4 bg-[#1a2133] border border-cyan-500/40 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#00aff0]/20 text-[#00aff0] flex items-center justify-center">
                            <VideoIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">{selectedVideoFile.name}</p>
                            <p className="text-[11px] text-gray-400">
                              {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedVideoFile.type || 'Video file'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVideoFile(null)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#2b354e] hover:border-[#00aff0] bg-[#161c2b]/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition group">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#00aff0] group-hover:scale-110 transition-transform mb-2" />
                        <span className="text-xs font-bold text-white mb-0.5">Click to choose video from your computer</span>
                        <span className="text-[11px] text-gray-400">Supported formats: .MP4, .MOV, .WebM (Up to 1GB 4K)</span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/x-m4v"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
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
                )}

                {/* Teaser Cover Picked Directly from Video */}
                <div className="p-4 bg-[#1a2133] rounded-2xl border border-[#2b354e] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Video Cover Thumbnail (Picked Directly from Your Video)</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {selectedVideoFile 
                          ? "Select your favorite frame captured directly from your video:" 
                          : "Upload a video file to pick frames from it, or select a teaser preset:"}
                      </p>
                    </div>

                    {customThumbnail && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Cover Selected
                      </span>
                    )}
                  </div>

                  {/* If Extracting Frames */}
                  {isExtractingFrames && (
                    <div className="p-4 bg-[#0e121b] border border-[#232b3f] rounded-xl flex items-center justify-center gap-2 text-xs text-cyan-300 animate-pulse">
                      <Film className="w-4 h-4 animate-spin" />
                      <span>Capturing high-definition frames directly from your video...</span>
                    </div>
                  )}

                  {/* Real Captured Video Frames Grid */}
                  {extractedFrames.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Captured Video Moments (Click to set as cover):
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {extractedFrames.map((frame, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCustomThumbnail(frame.dataUrl)}
                            className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition group ${
                              customThumbnail === frame.dataUrl
                                ? 'border-[#00aff0] scale-105 shadow-md shadow-cyan-500/30 ring-2 ring-[#00aff0]/30'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                            }`}
                          >
                            <img src={frame.dataUrl} alt={`Frame at ${frame.timeFormatted}`} className="w-full h-full object-cover" />
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-[9px] font-bold text-white rounded">
                              {frame.timeFormatted}
                            </div>
                            {customThumbnail === frame.dataUrl && (
                              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#00aff0] text-black flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Frame Scrubber */}
                      <div className="p-3 bg-[#0e121b] border border-[#232b3f] rounded-xl flex items-center gap-3">
                        <span className="text-[11px] text-gray-400 font-bold whitespace-nowrap">
                          Scrub Exact Frame ({formatVideoTime(scrubberTime)}):
                        </span>
                        <input
                          type="range"
                          min="0.5"
                          max="60"
                          step="0.5"
                          value={scrubberTime}
                          onChange={(e) => handleScrubFrame(parseFloat(e.target.value))}
                          className="flex-1 accent-[#00aff0] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Curated Presets & URL Fallback */}
                  <div className="pt-2 border-t border-[#232b3e]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                      {extractedFrames.length > 0 ? "Or Choose Teaser Preset / Custom Image URL:" : "Curated Teaser Presets:"}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {TEASER_PRESETS.map((cUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCustomThumbnail(cUrl)}
                          className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                            customThumbnail === cUrl ? 'border-[#00aff0] scale-105 shadow-md shadow-cyan-500/25 ring-2 ring-[#00aff0]/30' : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img src={cUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste custom image URL (https://...)"
                      value={customThumbnail.startsWith('data:image/') ? '' : customThumbnail}
                      onChange={(e) => setCustomThumbnail(e.target.value)}
                      className="w-full bg-[#131722] border border-[#2b354e] rounded-xl px-3.5 py-2 text-xs text-white mt-2 focus:outline-none focus:border-[#00aff0]"
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
                      <p className="text-[11px] text-gray-400">
                        {isLocked 
                          ? `🔒 Checked: Locked behind Paywall ($${price} PPV or active subscriber)` 
                          : "🔓 Unchecked: 100% FREE Video (Everyone can watch without paying!)"}
                      </p>
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
                      <span className="text-xs text-gray-300">Custom PPV / Unlock Price:</span>
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
                  className="w-full py-3.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{submitting ? "Uploading Video via Multer..." : "Publish Video to Platform"}</span>
                </button>
              </form>
            </>
          ) : (
            /* Video Storage Catalog */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Hosted Video Collection</h3>
                <span className="text-xs text-cyan-400 font-semibold">{uploadedVideos.length} Total Hosted Videos</span>
              </div>

              {uploadedVideos.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center">No videos uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {uploadedVideos.map((vid) => (
                    <div key={vid.id} className="p-3 bg-[#181e2b] border border-[#273148] rounded-2xl flex items-center justify-between gap-3">
                      <div 
                        onClick={() => setPreviewVideo(vid)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer group"
                      >
                        <div className="w-16 h-10 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-cyan-500/80 flex items-center justify-center">
                            <Play className="w-3 h-3 text-black fill-black ml-0.5" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-[#00aff0] transition-colors">{vid.title}</p>
                          <p className="text-[11px] text-gray-400 truncate">
                            By @{vid.uploader?.username || 'creator'} · {vid.videoUrl.startsWith('/uploads') ? 'Local Multer Storage' : 'Cloud Stream'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(vid)}
                          className="px-3 py-1.5 bg-[#00aff0]/10 hover:bg-[#00aff0] hover:text-black text-[#00aff0] text-xs font-bold rounded-xl border border-[#00aff0]/30 transition cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play</span>
                        </button>
                        
                        {(currentUser?.id === vid.uploaderId || currentUser?.role === 'admin') && (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetVideo(vid)}
                            title="Delete video file and feed post"
                            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-900/40 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              {/* Grant VIP Access Tool */}
              <div className="bg-[#181e2c] border border-[#2b354e] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#00aff0]" />
                      <span>Manually Grant VIP Subscription to Fan</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      When a fan pays you via CashApp, Gift Cards, or Crypto, enter their username here to unlock Nicole's vault for them.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGrantAccess} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter fan username or ID (e.g. alex_fan)"
                    value={grantUsername}
                    onChange={(e) => setGrantUsername(e.target.value)}
                    className="flex-1 bg-[#131722] border border-[#273148] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                  />
                  <button
                    type="submit"
                    disabled={grantLoading || !grantUsername.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-black font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <span>{grantLoading ? "Granting..." : "Activate VIP Access"}</span>
                  </button>
                </form>

                {grantMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    grantMsg.includes('success') 
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/50 border border-rose-900/40 text-rose-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{grantMsg}</span>
                  </div>
                )}
              </div>

              {/* VIP Code Generator & Share in Chat */}
              <div className="bg-[#181e2c] border border-[#2b354e] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-purple-400" />
                      <span>Instant VIP Activation Code Generator</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Generate unique codes to copy and send to fans directly in chat when they pay via CashApp, Crypto, or Gift Cards.
                    </p>
                  </div>
                </div>

                {/* Code Generation Form */}
                <form onSubmit={handleCreateCode} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#131722] border border-[#262f44] rounded-xl">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Custom code (e.g. VIP-GOLD or leave blank for auto)"
                      value={customNewCode}
                      onChange={(e) => setCustomNewCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#181e2c] border border-[#2d3a54] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00aff0]"
                    />
                  </div>

                  <div>
                    <select
                      value={newCodeTier}
                      onChange={(e) => setNewCodeTier(e.target.value)}
                      className="w-full bg-[#181e2c] border border-[#2d3a54] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Standard Fan">Standard ($60)</option>
                      <option value="VIP All-Access">VIP All-Access ($99)</option>
                    </select>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={codeGenerating}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 disabled:opacity-40 text-white font-extrabold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{codeGenerating ? "Generating..." : "Generate Code"}</span>
                    </button>
                  </div>
                </form>

                {/* Available Active VIP Codes List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Active VIP Codes ({vipCodes.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {vipCodes.map((c, i) => (
                      <div key={c.code || i} className="p-3 bg-[#131722] border border-[#273148] rounded-xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#00aff0]">{c.code}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 font-bold border border-purple-800/40">
                              ${c.price}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{c.tier} · {c.uses} used</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          className="px-2.5 py-1 bg-[#1a2133] hover:bg-[#252f48] text-gray-300 hover:text-white rounded-lg text-[10px] font-bold border border-[#2e3b56] transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCode === c.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode === c.code ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Subscribers Roster */}
              <div className="bg-[#181e2c] border border-[#2b354e] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Active VIP Subscribers ({subscribersList.length})</span>
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400">Auto-synced</span>
                </div>

                {subscribersList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center bg-[#131722] rounded-xl">
                    No active subscribers yet. Fans who redeem VIP codes or are granted access will show here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {subscribersList.map((sub) => (
                      <div key={sub.id} className="p-3 bg-[#131722] border border-[#273148] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={sub.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#00aff0]/40"
                          />
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              {sub.name} <span className="text-[10px] text-gray-400 font-normal">@{sub.username}</span>
                            </p>
                            <p className="text-[10px] text-emerald-400 font-semibold">{sub.tier} · Expires: {sub.expiresAt || 'Active'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          ACTIVE VIP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* In-Studio Video Playback Modal */}
          {previewVideo && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#131722] border border-[#2b354e] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{previewVideo.title}</h4>
                    <p className="text-xs text-gray-400">Direct Local Video Playback</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(null)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1f2638] transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                  <video
                    src={previewResolvedSrc || previewVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      if (e.currentTarget.src !== "https://vjs.zencdn.net/v/oceans.mp4") {
                        e.currentTarget.src = "https://vjs.zencdn.net/v/oceans.mp4";
                      }
                    }}
                  >
                    Your browser does not support HTML5 video.
                  </video>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1f2638]">
                  <span>Source: {previewVideo.videoUrl}</span>
                  <button
                    onClick={() => setPreviewVideo(null)}
                    className="px-4 py-1.5 bg-[#1f2638] hover:bg-[#2b354e] text-white rounded-xl font-bold transition cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Monthly Earnings Chart / Table */}
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
            <button className="w-full py-2 bg-[#1a2133] hover:bg-[#252f48] text-white text-xs font-bold rounded-xl border border-[#2b354e] transition cursor-pointer">
              Manage Bank & Tax Forms
            </button>
          </div>

        </div>

      </div>

      {/* Professional Deletion Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTargetVideo)}
        onClose={() => setDeleteTargetVideo(null)}
        onConfirm={handleConfirmDeleteVideo}
        title="Delete Video File Permanently?"
        itemName={deleteTargetVideo?.title}
        itemType="video"
        isLoading={isDeletingVideo}
      />

    </div>
  );
}
