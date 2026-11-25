import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Lock, 
  Video, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  DollarSign, 
  Eye, 
  Zap, 
  Users, 
  Gift, 
  Heart,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const featuredModels = [
    {
      id: "creator-1",
      name: "Nicole Shayla",
      username: "uni_ques78",
      age: 23,
      tag: "⭐ STAR CREATOR",
      category: "Trans & Solo VIP",
      price: 60.00,
      avatar: "/FhNtifmVQAEZDgwy.jpg",
      banner: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
      bio: "23 y trans girl & anal queen of your dreams 💦 Uncensored 4K solo vault, bedroom tapes, and priority 1-on-1 private DMs.",
      fans: "5,240 VIP Fans",
      tapes: "24 4K Tapes"
    },
    {
      id: "creator-2",
      name: "Chloe Rose 🏳️‍⚧️",
      username: "chloe_rose",
      age: 22,
      tag: "🔥 TRENDING",
      category: "Trans & TS Goddesses",
      price: 25.00,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80",
      bio: "22y Trans Glamour Model & Solo Queen 🏳️‍⚧️ Uncensored 4K solo tapes, GFE, silk robe tease, and private DMs.",
      fans: "2,310 VIP Fans",
      tapes: "16 4K Tapes"
    },
    {
      id: "creator-4",
      name: "Maya Lin 🏳️‍⚧️💋",
      username: "mayalin_ts",
      age: 23,
      tag: "💎 EXCLUSIVE",
      category: "Trans & TS Goddesses",
      price: 35.00,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&auto=format&fit=crop&q=80",
      bio: "23y Exotic TS Creator & Solo Star 🏳️‍⚧️ 100% Raw uncut 4K tapes, POV morning shower sessions, and interactive toy play.",
      fans: "1,940 VIP Fans",
      tapes: "12 4K Tapes"
    },
    {
      id: "creator-3",
      name: "Sasha Fox 🎀",
      username: "sashafox_vip",
      age: 21,
      tag: "🎀 COSPLAY ALT",
      category: "Cosplay & Alt Glamour",
      price: 30.00,
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
      bio: "21y Petite E-Girl & Alt Model 💕 4K anime & gaming cosplay try-ons, teasing solo sessions, and private snapchat access.",
      fans: "3,670 VIP Fans",
      tapes: "18 4K Sets"
    }
  ];

  return (
    <div className="flex-1 w-full bg-[#0b0e14] text-slate-100 overflow-x-hidden">
      
      {/* Standalone Dedicated Landing Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-[#1f2638] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Adult Gate Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00aff0] to-[#8b5cf6] p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#00aff0] fill-[#00aff0]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-white">
                  JUST<span className="text-[#00aff0]">FANS</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-pink-400">
                  Trans & VIP Network
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-700/40 text-[10px] font-black text-pink-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
              18+ Adults Only
            </span>
          </div>

          {/* Quick Anchor Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-gray-300">
            <a href="#models" className="hover:text-[#00aff0] transition">⭐ Star Models</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition">⚡ How It Works</a>
            <a href="#perks" className="hover:text-pink-400 transition">💎 VIP Perks</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/feed"
                className="px-5 py-2.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-black font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md hover:opacity-95 transition"
              >
                <span>Enter Social Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/feed"
                  className="px-4 py-2 bg-[#141b2b] hover:bg-[#1a2338] border border-[#263552] text-[#00aff0] font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Browse</span> Feed
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 bg-[#1a2133] hover:bg-[#252f47] border border-[#2b354e] text-white font-bold text-xs sm:text-sm rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:opacity-95 transition"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Logged In Quick Notification Banner */}
      {isAuthenticated && currentUser && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-[#131b2e] to-purple-950/80 border-b border-[#212f4d] py-2 px-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">Signed in as <strong className="text-white">@{currentUser.username}</strong> ({currentUser.role})</span>
          </div>
          <Link
            to="/feed"
            className="px-3 py-1 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold rounded-full flex items-center gap-1 transition"
          >
            <span>Open Social Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#00aff0]/15 via-purple-600/15 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />

        {/* 18+ Adult Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-950/70 to-purple-950/70 border border-pink-700/50 text-pink-300 text-xs font-black uppercase tracking-wider mb-6 shadow-lg shadow-pink-950/30">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <span>🔞 18+ Adults Only · Official Trans Model Network</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight sm:leading-none mb-6">
          The Premier Adult Platform for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aff0] via-[#c084fc] to-[#ec4899]">
            Trans Models & VIP Fans
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed mb-8">
          Uncensored full-length 4K video vaults, private 1-on-1 VIP DMs, and authentic adult entertainment. Built for models who own their craft, and fans who appreciate real intimacy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-12 relative z-10">
          <Link
            to="/feed"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00aff0] to-[#0081b8] hover:from-[#00c0ff] hover:to-[#00aff0] text-black font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span>Enter Social Feed & Vaults</span>
          </Link>

          <Link
            to="/signup"
            className="w-full sm:w-auto px-7 py-4 bg-[#141b2b] hover:bg-[#1a2338] border border-[#263552] text-white font-bold text-sm sm:text-base rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-5 h-5 text-[#00aff0]" />
            <span>Sign Up Free (Unlock Previews)</span>
          </Link>

          <Link
            to="/signup?role=creator"
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-purple-950/70 to-pink-950/70 hover:from-purple-900/80 hover:to-pink-900/80 border border-purple-700/50 text-purple-300 font-bold text-sm sm:text-base rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flame className="w-5 h-5 text-pink-400" />
            <span>Trans Creator Sign Up</span>
          </Link>
        </div>

        {/* Live Social Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl p-4 bg-[#111624]/90 border border-[#232f48] rounded-3xl shadow-xl">
          <div className="p-3 text-center">
            <p className="text-xl sm:text-2xl font-black text-white">4</p>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Verified Stars</p>
          </div>
          <div className="p-3 text-center border-l border-[#1f283d]">
            <p className="text-xl sm:text-2xl font-black text-[#00aff0]">100%</p>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Uncut 4K Tapes</p>
          </div>
          <div className="p-3 text-center border-l border-[#1f283d]">
            <p className="text-xl sm:text-2xl font-black text-purple-400">1-on-1</p>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Private DMs</p>
          </div>
          <div className="p-3 text-center border-l border-[#1f283d]">
            <p className="text-xl sm:text-2xl font-black text-emerald-400">Discrete</p>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">CashApp / Crypto</p>
          </div>
        </div>
      </section>

      {/* Featured Star Models Roster */}
      <section id="models" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
              <Star className="w-4 h-4 fill-purple-400 text-purple-400" />
              <span>Official Creator Roster</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Meet Our Star Trans Models
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Direct access to their exclusive content, private messaging, and full 4K video archives.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00aff0] hover:text-[#0094cc] transition"
          >
            <span>Browse All Models</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredModels.map((model) => (
            <div
              key={model.id}
              className="bg-[#121724] border border-[#232e46] rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-[#00aff0]/60 transition-all duration-300"
            >
              {/* Banner with Tag */}
              <div className="relative h-28 w-full bg-[#0d111a] overflow-hidden">
                <img
                  src={model.banner}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/70 border border-white/20 text-white backdrop-blur-sm">
                  {model.tag}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col -mt-8 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={model.avatar}
                    alt={model.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#121724] shadow-xl flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-white truncate flex items-center gap-1">
                      {model.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00aff0] flex-shrink-0" />
                    </h3>
                    <p className="text-[11px] text-cyan-400 font-medium">@{model.username}</p>
                    <span className="text-[10px] text-gray-400">{model.category}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4 flex-1">
                  {model.bio}
                </p>

                <div className="pt-3 border-t border-[#1f283d] flex items-center justify-between text-xs mb-3">
                  <span className="text-gray-400 font-semibold">{model.tapes}</span>
                  <span className="font-black text-white">${model.price.toFixed(2)}<span className="text-[10px] font-normal text-gray-400">/mo</span></span>
                </div>

                <Link
                  to={`/creator/${model.username}`}
                  className="w-full py-2.5 bg-[#1a2336] hover:bg-[#00aff0] hover:text-black border border-[#2b3a58] hover:border-[#00aff0] text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Model Channel</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section (The Core Social Media + Timed Video Pass Concept) */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#0e131e]/70 border-y border-[#1f2a40] scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>How JustFans Works</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Adult Content Freedom Like Social Media
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Designed for seamless creator-to-fan connection, instant social feed updates, and flexible viewing passes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#131826] border border-[#232e46] rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-[#00aff0] font-black text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-black text-base text-white mb-2">Live Social Feed</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Whenever Nicole Shayla or any trans model publishes a post, trailer, or photo set, it immediately appears on the shared community feed for all fans and models.
            </p>
          </div>

          <div className="bg-[#131826] border border-[#232e46] rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 font-black text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-black text-base text-white mb-2">VIP Vault Passes</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Subscribe to your favorite model to unlock her private 4K video catalog and watch full-length uncut releases with your active subscription pass.
            </p>
          </div>

          <div className="bg-[#131826] border border-[#232e46] rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 font-black text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-black text-base text-white mb-2">Timed Passes & PPV</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Watch initial releases with your pass. Premium extended vault tapes or individual pay-per-view videos can be unlocked on-demand with one click.
            </p>
          </div>

          <div className="bg-[#131826] border border-[#232e46] rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 font-black text-lg flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="font-black text-base text-white mb-2">Direct Discrete Pay</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Support models directly via CashApp, Apple/Steam Gift Cards, or USDT Crypto. Zero awkward credit card statement names or bank rejections.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Security & Watermarking Highlights */}
      <section id="perks" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-r from-[#17142b] via-[#121626] to-[#111c2e] border border-purple-800/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4" />
                Anti-Leak Protection & Model Safety
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
                Dynamic 4K Video Watermarking & Strict 18+ Verification
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Every frame streamed on JustFans is dynamically stamped with anti-leak forensic watermarks tied to the viewer's account. Models keep 100% control of their content, while fans enjoy cinema-grade 4K streaming.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Forensic fan-handle watermark on unlocked 4K video playback</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Age 18+ strict enforcement under federal USC 2257 guidelines</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Private DMs with tip-to-message priority & custom clip ordering</span>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div className="p-6 bg-[#0b0e14]/90 border border-[#2b3752] rounded-3xl shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-[#212b40] pb-3 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  JustFans 4K VIP Player
                </span>
                <span className="text-[10px] text-pink-400 font-black bg-pink-950/70 border border-pink-700/50 px-2 py-0.5 rounded-full">
                  PROTECTED
                </span>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80"
                  alt="Player Preview"
                  className="w-full h-full object-cover filter blur-[2px] opacity-70"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                  <Lock className="w-8 h-8 text-[#00aff0] mb-2" />
                  <p className="text-xs font-black text-white">Full 4K Uncensored Vault Access</p>
                  <p className="text-[11px] text-gray-300 mt-1">Unlocked for active VIP subscribers</p>
                </div>
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 border border-white/20 text-[10px] text-cyan-300 font-mono">
                  🔒 VIP Watermark: @fan_member
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Onboarding Callout */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="p-8 sm:p-14 bg-gradient-to-b from-[#141b2c] to-[#0f1422] border border-[#25334d] rounded-3xl shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            Are You a Trans Model or Content Creator?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join the most creator-friendly adult platform in the industry. Set your own subscription prices, generate VIP passes, receive direct tips, and connect with verified paying fans.
          </p>

          <Link
            to="/signup?role=creator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-[#00aff0] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:opacity-95 transition"
          >
            <span>Create Your Creator Studio Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

