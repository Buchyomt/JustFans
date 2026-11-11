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
  CheckCircle2,
  Upload,
  Film,
  Video as VideoIcon,
  X,
  Play
} from 'lucide-react';

export default function CreatorStudioPage() {
  const { currentUser, authFetch, switchDemo } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  // New post / video state
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('video');
  const [isLocked, setIsLocked] = useState(true);
  const [price, setPrice] = useState('4.99');
  
  // Real video file upload state
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'

  const [submitting, setSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('composer'); // 'composer' or 'videos'

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

  useEffect(() => {
    fetchAnalytics();
    fetchUploadedVideos();
  }, [currentUser]);

  const handleFileChange = (e) => {
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
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setPublishSuccess(false);

    try {
      if (mediaType === 'video' && selectedVideoFile) {
        // Multipart/form-data upload to POST /api/videos
        const formData = new FormData();
        formData.append('video', selectedVideoFile);
        formData.append('title', title);
        formData.append('description', caption);
        formData.append('isLocked', isLocked);
        formData.append('priceToUnlock', price);

        const res = await authFetch('/api/videos', {
          method: 'POST',
          body: formData
          // Note: Browser automatically sets Content-Type with boundary for FormData
        });
        const data = await res.json();
        if (data.success) {
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
          <img
            src={analytics?.creator?.avatar || currentUser?.avatar}
            alt="Creator"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8b5cf6]"
          />
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

        {currentUser?.role !== 'creator' && (
          <button
            onClick={() => switchDemo('creator-1')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
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
                <span>Video Storage Catalog ({uploadedVideos.length})</span>
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
                      Select Video File (Multer Handler: MP4, MOV, WebM · Max 150MB)
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
                        <span className="text-[11px] text-gray-400">Supported formats: .MP4, .MOV, .WebM (Up to 150MB)</span>
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

                {/* Paywall Controls */}
                <div className="p-4 bg-[#1a2133] rounded-2xl border border-[#2b354e] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#00aff0]" />
                        <span>Monetize Content (Subscriber-Only & PPV)</span>
                      </p>
                      <p className="text-[11px] text-gray-400">Lock this video so non-subscribers must pay to view</p>
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
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-10 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-80" />
                          <Play className="w-4 h-4 text-white absolute inset-0 m-auto fill-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{vid.title}</p>
                          <p className="text-[11px] text-gray-400 truncate">
                            By @{vid.uploader?.username || 'creator'} · {vid.videoUrl.startsWith('/uploads') ? 'Local Multer Storage' : 'Cloud Stream'}
                          </p>
                        </div>
                      </div>

                      <a
                        href={vid.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-[#00aff0]/10 hover:bg-[#00aff0] hover:text-black text-[#00aff0] text-xs font-bold rounded-lg border border-[#00aff0]/30 transition"
                      >
                        Watch
                      </a>
                    </div>
                  ))}
                </div>
              )}
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

    </div>
  );
}
