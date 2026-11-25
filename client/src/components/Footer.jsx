import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  X,
  Play,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pause
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const [modalContent, setModalContent] = useState(null); // 'terms' | 'privacy' | '2257' | 'dmca' | null
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);

  const slidingItems = [
    {
      id: 1,
      type: 'video',
      title: 'Late Night Solo Masterpiece #4',
      category: '4K Ultra HD',
      duration: '38:45',
      likes: '1.4k',
      rating: '4.98',
      price: '$18.66 PPV',
      badge: 'HOT 🔥',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
      creator: 'Nicole Shayla'
    },
    {
      id: 2,
      type: 'review',
      author: 'Marcus_VIP',
      role: 'Diamond VIP',
      quote: 'Her $60/mo vault access is the real deal. Zero censorship, 4K quality, and Nicole actually replies in DM!',
      stars: 5,
      tag: 'Verified Subscriber'
    },
    {
      id: 3,
      type: 'video',
      title: 'Custom Shower Cam Routine',
      category: 'Exclusive Request',
      duration: '22:10',
      likes: '890',
      rating: '5.0',
      price: 'Included in VIP',
      badge: 'UNCUT 💎',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      creator: 'Nicole Shayla'
    },
    {
      id: 4,
      type: 'review',
      author: 'Elena_K',
      role: 'Supporter',
      quote: 'The uncompressed 4K video player loads instantly with zero buffering. Nicole sets the gold standard.',
      stars: 5,
      tag: 'Verified Fan'
    },
    {
      id: 5,
      type: 'video',
      title: 'Bedroom Confessions & Solo Teaser',
      category: 'Free Preview',
      duration: '06:15',
      likes: '3.2k',
      rating: '4.95',
      price: 'Free Preview',
      badge: 'FREE 🔓',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
      creator: 'Nicole Shayla'
    },
    {
      id: 6,
      type: 'review',
      author: 'David_NY',
      role: 'Top Tipper',
      quote: 'Subscribed 2 months ago and never looked back. The weekly new drops keep getting better.',
      stars: 5,
      tag: 'Top Tipper'
    },
    {
      id: 7,
      type: 'video',
      title: 'Private Q&A + Form Check Reel',
      category: 'VIP Masterclass',
      duration: '45:30',
      likes: '1.8k',
      rating: '4.99',
      price: '$18.66 PPV',
      badge: 'NEW ⭐',
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
      creator: 'Nicole Shayla'
    },
    {
      id: 8,
      type: 'review',
      author: 'Jordan_T',
      role: 'VIP Member',
      quote: 'Direct CashApp & Gift Card support directly to Nicole makes supporting super easy, fast, and 100% legit.',
      stars: 5,
      tag: 'Verified Fan'
    }
  ];

  const handleManualScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-[#0b0e14] border-t border-[#1f2638] text-gray-400 py-10 px-4 lg:px-8 mt-auto text-xs overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Animated Sliding Content Reel (Back and Forth Live Ticker) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Live Vault Reel · Sliding Teasers & VIP Drops
                </span>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-2.5 py-1 bg-[#141926] hover:bg-[#1f273d] border border-[#232d44] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title={isPaused ? "Resume auto-sliding" : "Pause auto-sliding"}
                >
                  {isPaused ? <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleManualScroll('left')}
                    className="p-1.5 bg-[#141926] hover:bg-[#1f273d] border border-[#232d44] text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManualScroll('right')}
                    className="p-1.5 bg-[#141926] hover:bg-[#1f273d] border border-[#232d44] text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sliding Container with Gradient Edge Fades */}
            <div className="relative rounded-2xl overflow-hidden py-1">
              {/* Left & Right Smooth Edge Masks */}
              <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/60 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#0b0e14] via-[#0b0e14]/60 to-transparent z-10 pointer-events-none"></div>

              {/* Scrollable Track */}
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-none py-2"
              >
                <div 
                  className={`flex items-center gap-4 ${isPaused ? '' : 'footer-marquee-track'}`}
                  style={{ willChange: 'transform' }}
                >
                  {/* Render items twice to support continuous seamless wrap */}
                  {[...slidingItems, ...slidingItems].map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-[#131722] to-[#10141f] border border-[#222c42] hover:border-purple-500/60 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                      {item.type === 'video' ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0b0e14] border border-[#222b3e]">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-pink-600/90 group-hover:bg-pink-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-[10px] font-black text-pink-400 rounded-md border border-pink-500/30">
                              {item.badge}
                            </span>
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-[10px] font-bold text-gray-200 rounded">
                              {item.duration}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{item.category}</p>
                            <h4 className="text-xs font-black text-white truncate group-hover:text-cyan-300 transition">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1e273a]">
                            <span className="font-extrabold text-white flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-pink-500" />
                              {item.likes}
                            </span>
                            <span className="font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                              {item.price}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 flex flex-col justify-between h-full min-h-[160px]">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00aff0] to-[#8b5cf6] flex items-center justify-center text-[11px] font-black text-white">
                                  {item.author[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white">{item.author}</p>
                                  <p className="text-[9px] text-gray-400">{item.role}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                                {item.tag}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-300 leading-relaxed italic line-clamp-3">
                              "{item.quote}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-[#1e273a]">
                            <div className="flex text-amber-400">
                              {"★".repeat(item.stars)}
                            </div>
                            <span className="text-gray-400 font-semibold">Verified Purchase</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Security Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#1f2638]/70">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#131722] border border-[#222b3e]">
              <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-[11px]">256-Bit SSL</p>
                <p className="text-[10px] text-gray-500">End-to-End Encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#131722] border border-[#222b3e]">
              <ShieldCheck className="w-5 h-5 text-[#00aff0] flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-[11px]">Identity Verified</p>
                <p className="text-[10px] text-gray-500">Official Creator Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#131722] border border-[#222b3e]">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-[11px]">18+ Content Gate</p>
                <p className="text-[10px] text-gray-500">RTA Restricted to Adults</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#131722] border border-[#222b3e]">
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-[11px]">USC 2257 Compliant</p>
                <p className="text-[10px] text-gray-500">Record-Keeping Verified</p>
              </div>
            </div>
          </div>

          {/* Links & Statement */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-lg font-black tracking-tight text-white">JUST<span className="text-[#00aff0]">FANS</span></span>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                  Nicole Shayla VIP Hub
                </span>
              </div>
              <p className="text-[11px] text-gray-400 max-w-xl leading-relaxed">
                Direct subscription platform empowering creators to distribute 4K uncensored media, host exclusive masterclasses, and receive direct fan patronage with 100% creator ownership.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <button 
                onClick={() => setModalContent('terms')}
                className="hover:text-white transition cursor-pointer text-gray-300 hover:underline"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button 
                onClick={() => setModalContent('privacy')}
                className="hover:text-white transition cursor-pointer text-gray-300 hover:underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button 
                onClick={() => setModalContent('2257')}
                className="hover:text-white transition cursor-pointer text-gray-300 hover:underline"
              >
                18 U.S.C. 2257
              </button>
              <span>•</span>
              <button 
                onClick={() => setModalContent('dmca')}
                className="hover:text-white transition cursor-pointer text-gray-300 hover:underline"
              >
                DMCA Notice
              </button>
            </div>
          </div>

          {/* Copyright & USC 2257 Compliance Footnote */}
          <div className="pt-4 border-t border-[#1f2638]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-500">
            <p>&copy; {CURRENT_YEAR} JustFans Inc. All rights reserved. Age 18+ strictly enforced.</p>
            <p>All models and content producers appearing on this site were at least 18 years of age at the time of production.</p>
          </div>

        </div>
      </footer>

      {/* Legal Popups */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative text-gray-300 space-y-4">
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {modalContent === 'terms' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00aff0]" />
                  <span>Terms of Service</span>
                </h3>
                <div className="text-xs space-y-2 leading-relaxed text-gray-400">
                  <p>Welcome to JustFans. By accessing or using our platform, you agree to comply with our Terms of Service. You must be at least 18 years old to create an account, subscribe to creators, or upload media.</p>
                  <p>Creators retain 100% intellectual property ownership of all videos and images uploaded. Unauthorized downloading, screen-recording, or redistribution of paywalled media is strictly prohibited and subject to legal prosecution under DMCA.</p>
                  <p>Subscriptions renew every 30 days unless cancelled. Direct payments made to creator tags (CashApp, Gift Cards, Crypto) are processed directly with the creator.</p>
                </div>
              </>
            )}

            {modalContent === 'privacy' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Privacy Policy</span>
                </h3>
                <div className="text-xs space-y-2 leading-relaxed text-gray-400">
                  <p>Your privacy and discretion are paramount. We do not sell your personal data, email addresses, or browsing history to third-party advertisers.</p>
                  <p>All sensitive transactions are encrypted via industry-standard SSL encryption. Your email address is strictly used for authentication and service verification codes.</p>
                </div>
              </>
            )}

            {modalContent === '2257' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>18 U.S.C. 2257 Record-Keeping Compliance</span>
                </h3>
                <div className="text-xs space-y-2 leading-relaxed text-gray-400">
                  <p>All records required to be maintained pursuant to 18 U.S.C. § 2257 and 28 C.F.R. Part 75 concerning all depictions of actual or simulated sexually explicit conduct found on this website are maintained by the records custodian.</p>
                  <p>All content producers and models appearing on this site were 18 years of age or older at the time of content creation. Age verification records and government-issued photo IDs are verified prior to account activation.</p>
                </div>
              </>
            )}

            {modalContent === 'dmca' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>DMCA Copyright Notice</span>
                </h3>
                <div className="text-xs space-y-2 leading-relaxed text-gray-400">
                  <p>JustFans respects the intellectual property rights of others. If you believe your copyrighted work has been infringed, please submit a formal takedown request containing the URL and proof of ownership to <strong>dmca@justfans.io</strong>.</p>
                </div>
              </>
            )}

            <button
              onClick={() => setModalContent(null)}
              className="w-full py-2.5 bg-[#1a2133] hover:bg-[#252f48] text-white font-bold text-xs rounded-xl border border-[#2b354e] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

