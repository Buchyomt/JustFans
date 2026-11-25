import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Wallet, 
  Save, 
  ArrowLeft,
  Mail,
  AtSign,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, authFetch, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [banner, setBanner] = useState(
    currentUser?.banner || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80'
  );

  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const [bannerPreview, setBannerPreview] = useState(
    currentUser?.banner || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80'
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Preset avatars for fans
  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80"
  ];

  // Handle avatar file upload
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatar(dataUrl);
      setAvatarPreview(dataUrl);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Handle banner file upload
  const handleBannerFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setBanner(dataUrl);
      setBannerPreview(dataUrl);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Submit profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
          avatar,
          banner
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Your profile and photos have been updated successfully! ✨');
        if (data.user) {
          updateProfile(data.user);
        }
        setTimeout(() => setSuccessMsg(''), 4500);
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8 space-y-6">
      
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Account Settings</span>
        </div>
      </div>

      {/* Main Profile Card Container */}
      <div className="bg-[#131722] border border-[#232b3f] rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Cover Banner Area with Change Button */}
        <div className="relative h-44 sm:h-56 w-full bg-[#0e121b] overflow-hidden group">
          <img
            src={bannerPreview}
            alt="Cover Banner"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131722] via-transparent to-black/30 pointer-events-none" />

          {/* Banner Upload Button */}
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 hover:bg-black/90 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Cover</span>
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerFile}
            className="hidden"
          />
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            
            {/* Avatar & Upload Trigger */}
            <div className="relative inline-block">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-[#131722] border-4 border-[#131722] shadow-2xl relative group">
                <img
                  src={avatarPreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}
                  alt={name || "Profile"}
                  className="w-full h-full rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-1 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer"
                >
                  <Camera className="w-5 h-5 mb-1 text-cyan-400" />
                  <span>Upload Photo</span>
                </button>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="sm:hidden mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-400"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Avatar</span>
              </button>
            </div>

            {/* Quick Status / Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border ${
                currentUser?.role === 'creator'
                  ? 'bg-purple-950/80 border-purple-700/60 text-purple-300'
                  : 'bg-cyan-950/80 border-cyan-800/50 text-cyan-300'
              }`}>
                {currentUser?.role === 'creator' ? '⭐ Model Owner / Creator' : '💎 Fan Member'}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b2233] border border-[#2c3750] text-xs text-gray-300">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Balance: </span>
                <span className="font-black text-emerald-400">${(currentUser?.walletBalance || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm text-rose-300 animate-in fade-in">
              <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Quick Preset Avatars Picker */}
            <div className="p-4 bg-[#0e121b] border border-[#21283d] rounded-2xl space-y-2.5">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Or Choose a Quick Preset Avatar:</span>
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {presetAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatar(url);
                      setAvatarPreview(url);
                    }}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${
                      avatarPreview === url ? 'border-[#00aff0] scale-105 shadow-md shadow-cyan-500/30' : 'border-[#26314a] hover:border-gray-400'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name & Username Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Display Name"
                    className="w-full bg-[#181f30] border border-[#28344e] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00aff0] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-[#181f30] border border-[#28344e] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00aff0] transition"
                  />
                </div>
              </div>
            </div>

            {/* Bio / About Me */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Bio / About Me
              </label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio or status (visible to creators and fans)..."
                className="w-full bg-[#181f30] border border-[#28344e] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00aff0] transition resize-none leading-relaxed"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Tell creators what kind of content you love or how you prefer to support them.
              </p>
            </div>

            {/* Email (Read Only Display) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full bg-[#0e121b] border border-[#232b3d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified JustFans Account
              </span>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 border-t border-[#232b3f] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                Changes will take effect immediately across all comments, DMs, and feeds.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-[#00aff0] hover:bg-[#0094cc] disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}

