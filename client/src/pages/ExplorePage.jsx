import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubscribeModal from '../components/SubscribeModal';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Filter
} from 'lucide-react';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubCreator, setActiveSubCreator] = useState(null);

  const categories = [
    'All',
    'Trans & TS Goddesses',
    'Trans & Solo VIP',
    'Cosplay & Alt Glamour',
    'GFE & Intimate Solos'
  ];

  const fetchCreators = async () => {
    try {
      setLoading(true);
      let url = '/api/creators?';
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCreators(data.creators);
      }
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [selectedCategory, search]);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121927] via-[#1a2133] to-[#141525] border border-[#273148] p-6 lg:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00aff0]/10 border border-[#00aff0]/30 text-[#00aff0] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Top Creators</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Explore <span className="text-[#00aff0]">Exclusive Creator Channels</span>
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            Directly subscribe and support top female and trans content creators with uncensored 4K video vaults, private DMs, and exclusive solo content.
          </p>

          {/* Search bar inside header */}
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, handle, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0b0e14]/90 border border-[#2d374f] text-sm text-white rounded-full pl-11 pr-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#00aff0] focus:ring-1 focus:ring-[#00aff0] shadow-inner"
            />
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition flex-shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#00aff0] text-black border-[#00aff0] shadow-md shadow-cyan-500/20'
                : 'bg-[#131722] text-gray-400 border-[#1f2638] hover:text-white hover:border-[#2d374f]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Creators Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-[#131722] border border-[#1f2638] rounded-3xl h-80 animate-pulse"></div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-12 text-center max-w-md mx-auto">
          <Filter className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Creators Found</h4>
          <p className="text-xs text-gray-400 mb-4">No channels matched your search. Try resetting filters.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearch(''); }}
            className="px-4 py-2 bg-[#00aff0] text-black font-bold text-xs rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div
              key={c.id}
              className="bg-[#131722] border border-[#1f2638] hover:border-[#2f3b54] rounded-3xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between"
            >
              {/* Creator Card Header: Banner + Avatar */}
              <div>
                <div className="relative h-28 bg-[#1a2133] overflow-hidden">
                  <img
                    src={c.banner || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131722] to-transparent"></div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-cyan-400 border border-white/10">
                    ${(c.monthlyPrice || 9.99).toFixed(2)}/mo
                  </div>
                </div>

                <div className="px-5 -mt-10 relative z-10 flex items-end justify-between">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-[#131722] shadow-xl"
                  />
                </div>

                {/* Creator Details */}
                <div className="p-5 pt-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-extrabold text-white text-base group-hover:text-[#00aff0] transition-colors">
                      {c.name}
                    </h3>
                    {c.verified && (
                      <CheckCircle2 className="w-4 h-4 text-[#00aff0] fill-[#00aff0]/20" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">@{c.username} · <span className="text-cyan-400">{c.category}</span></p>
                  
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-4">
                    {c.bio}
                  </p>

                  {/* Creator Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#0e121b] rounded-2xl border border-[#1f2638] text-center mb-4">
                    <div>
                      <p className="text-[11px] font-extrabold text-white">{(c.subscriberCount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">Subscribers</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-white">{c.postCount || 12}</p>
                      <p className="text-[10px] text-gray-500">Posts</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-white">{(c.likeCount ? (c.likeCount / 1000).toFixed(1) + 'k' : '1.2k')}</p>
                      <p className="text-[10px] text-gray-500">Likes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 flex items-center gap-2">
                <Link
                  to={`/creator/${c.username}`}
                  className="flex-1 py-2.5 bg-[#1a2133] hover:bg-[#242e47] text-gray-200 font-bold text-xs rounded-xl text-center border border-[#2b354e] transition"
                >
                  View Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveSubCreator(c)}
                  className="flex-1 py-2.5 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-xl text-center shadow-lg transition"
                >
                  Join Channel
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Subscribe Modal */}
      {activeSubCreator && (
        <SubscribeModal
          creator={activeSubCreator}
          onClose={() => setActiveSubCreator(null)}
          onSubscribeSuccess={() => {
            fetchCreators();
          }}
        />
      )}

    </div>
  );
}
