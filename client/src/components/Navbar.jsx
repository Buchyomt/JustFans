import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Search, 
  Wallet, 
  LayoutDashboard, 
  X, 
  Check, 
  Sparkles,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, isAuthenticated, logout, switchDemo, updateBalance } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [fundsToAdd, setFundsToAdd] = useState('50');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddFunds = () => {
    const amt = parseFloat(fundsToAdd);
    if (!isNaN(amt) && amt > 0 && currentUser) {
      updateBalance((currentUser.walletBalance || 0) + amt);
      setShowWalletModal(false);
    }
  };

  const demoAccounts = [
    { id: 'user-fan-1', name: 'Alex Johnson', role: 'fan', tag: 'VIP Subscriber' },
    { id: 'creator-1', name: 'Aria Nova', role: 'creator', tag: 'Fitness & Wellness' },
    { id: 'creator-2', name: 'Marcus Cole', role: 'creator', tag: 'Music & Beats' },
    { id: 'creator-3', name: 'Elena Rostova', role: 'creator', tag: 'Concept Artist' },
    { id: 'creator-4', name: 'Kai Vance', role: 'creator', tag: 'Tech & Gaming' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0e121b]/90 backdrop-blur-md border-b border-[#1f2638] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00aff0] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tight text-white">JUST<span className="text-[#00aff0]">FANS</span></span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium -mt-1 tracking-wider uppercase">Creators & Video</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search creators, categories, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161c2b] text-sm text-gray-100 placeholder-gray-500 rounded-full pl-10 pr-4 py-2 border border-[#273148] focus:outline-none focus:border-[#00aff0] focus:ring-1 focus:ring-[#00aff0] transition"
            />
          </form>

          {/* Quick link to Star Creator */}
          <Link
            to="/creator/aria_fit"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-700/40 text-cyan-300 hover:text-white hover:border-[#00aff0] text-xs font-bold transition flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>⭐ Star Channel</span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            
            {isAuthenticated ? (
              <>
                {/* Wallet button */}
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 bg-[#161c2b] hover:bg-[#1f283d] border border-[#273148] rounded-full px-3.5 py-1.5 transition text-sm cursor-pointer group"
                  title="Click to add test wallet funds"
                >
                  <Wallet className="w-4 h-4 text-[#00aff0] group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-white">
                    ${(currentUser?.walletBalance || 0).toFixed(2)}
                  </span>
                  <span className="hidden sm:inline text-xs text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded-full font-bold">+</span>
                </button>

                {/* Studio button (if creator) or explore */}
                {currentUser?.role === 'creator' ? (
                  <Link
                    to="/studio"
                    className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#8b5cf6] to-[#00aff0] hover:opacity-95 text-white font-semibold text-xs px-3.5 py-2 rounded-full shadow-md shadow-purple-500/20 transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Upload Studio</span>
                  </Link>
                ) : (
                  <Link
                    to="/explore"
                    className="hidden sm:flex items-center gap-1.5 bg-[#161c2b] hover:bg-[#1f283d] border border-[#273148] text-gray-200 text-xs font-semibold px-3.5 py-2 rounded-full transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Discover</span>
                  </Link>
                )}

                {/* Account & Demo Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                    className="flex items-center gap-2 bg-[#161c2b] hover:bg-[#1e2538] border border-[#273148] rounded-full p-1 sm:pr-3 transition cursor-pointer"
                  >
                    <img
                      src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={currentUser?.name || "User"}
                      className="w-7 h-7 rounded-full object-cover border border-[#00aff0]/50"
                    />
                    <span className="hidden sm:inline text-xs font-medium text-gray-200 truncate max-w-[100px]">
                      {currentUser?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#00aff0]/20 text-[#00aff0] hidden sm:inline">
                      {currentUser?.role}
                    </span>
                  </button>

                  {showSwitchMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#131722] border border-[#262c3d] rounded-2xl shadow-2xl p-2 z-50">
                      <div className="px-3 py-2 border-b border-[#262c3d]/60 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Switch Test Identity</p>
                        <p className="text-[11px] text-gray-500">Fast one-click persona switching</p>
                      </div>
                      <div className="space-y-1 mb-2">
                        {demoAccounts.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => {
                              switchDemo(acc.id);
                              setShowSwitchMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                              currentUser?.id === acc.id ? 'bg-[#00aff0]/15 border border-[#00aff0]/40' : 'hover:bg-[#1a2030]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                {acc.name}
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  acc.role === 'creator' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'
                                }`}>
                                  {acc.role}
                                </span>
                              </p>
                              <p className="text-[11px] text-gray-400">{acc.tag}</p>
                            </div>
                            {currentUser?.id === acc.id && (
                              <Check className="w-4 h-4 text-[#00aff0]" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Log out */}
                      <div className="pt-1 border-t border-[#262c3d]/60">
                        <button
                          onClick={() => {
                            logout();
                            setShowSwitchMenu(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated Nav Actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-[#00aff0]" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-extrabold text-xs rounded-full shadow-lg shadow-cyan-500/20 hover:opacity-95 transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Wallet Top-up Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-[#00aff0] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg text-white">Add Test Balance</h3>
              </div>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Add sandbox credit to test tipping creators, purchasing locked PPV videos, or subscribing to tiers.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['25', '50', '100'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFundsToAdd(val)}
                  className={`py-2 rounded-xl text-sm font-bold border transition ${
                    fundsToAdd === val 
                      ? 'bg-[#00aff0] text-black border-[#00aff0]' 
                      : 'bg-[#1a2133] text-gray-300 border-[#2b354e] hover:border-gray-400'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddFunds}
              className="w-full py-3 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition cursor-pointer"
            >
              Deposit ${fundsToAdd}.00
            </button>
          </div>
        </div>
      )}
    </>
  );
}
