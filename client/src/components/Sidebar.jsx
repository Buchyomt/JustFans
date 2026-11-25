import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Compass, 
  UserCheck, 
  MessageSquare, 
  Bookmark, 
  LayoutDashboard,
  LogIn,
  User,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, isAuthenticated } = useAuth();

  const navLinks = [
    { to: '/feed', label: 'Home Feed', icon: Home },
    { to: '/', label: 'Platform & Perks', icon: Sparkles },
    { to: '/explore', label: 'Explore Creators', icon: Compass },
    { to: '/subscriptions', label: 'My Subscriptions', icon: UserCheck },
    { to: '/messages', label: 'Messages & PPV', icon: MessageSquare },
    { to: '/bookmarks', label: 'Saved Posts', icon: Bookmark },
    ...(isAuthenticated ? [
      { to: '/profile', label: 'My Profile & Photos', icon: User }
    ] : []),
    ...(currentUser?.role === 'creator' ? [
      { to: '/studio', label: 'Creator Studio', icon: LayoutDashboard, highlight: true }
    ] : [])
  ];

  return (
    <>
      {/* Desktop / Tablet Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#1f2638] bg-[#0b0e14]/50 backdrop-blur-sm p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        
        {/* Navigation list */}
        <nav className="space-y-1.5 flex-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#00aff0]/20 to-[#8b5cf6]/20 text-[#00aff0] border border-[#00aff0]/30 shadow-sm' 
                    : item.highlight 
                      ? 'text-purple-300 hover:bg-purple-950/40 hover:text-white' 
                      : 'text-gray-400 hover:bg-[#161c2b] hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                    PRO
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar or Sign In CTA */}
        {isAuthenticated && currentUser ? (
          <div className="pt-4 border-t border-[#1f2638]">
            <Link
              to="/profile"
              className="flex items-center gap-3 p-3 bg-[#131722] hover:bg-[#192133] rounded-2xl border border-[#273148] hover:border-[#00aff0]/40 transition group cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#00aff0] group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-[#00aff0] transition-colors">{currentUser.name}</p>
                <p className="text-[11px] text-gray-400 truncate">@{currentUser.username}</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="Online"></div>
            </Link>
          </div>
        ) : (
          <div className="pt-4 border-t border-[#1f2638]">
            <div className="p-3.5 bg-[#131722] rounded-2xl border border-[#273148] text-center">
              <p className="text-xs font-bold text-white mb-1">Join JustFans</p>
              <p className="text-[11px] text-gray-400 mb-3">Sign in to support creators and unlock 4K feeds.</p>
              <Link
                to="/login"
                className="w-full py-2 bg-[#00aff0] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e121b]/95 backdrop-blur-lg border-t border-[#1f2638] px-3 py-2 flex items-center justify-around">
        {navLinks.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition
                ${isActive ? 'text-[#00aff0]' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
}
