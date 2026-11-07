import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  Compass
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { currentUser, authFetch, refreshUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/subscriptions/my');
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [currentUser]);

  const handleCancelSub = async (creatorId) => {
    if (!confirm('Are you sure you want to cancel this membership? You will retain access until the billing cycle ends.')) {
      return;
    }

    try {
      const res = await authFetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId })
      });
      const data = await res.json();
      if (data.success) {
        fetchSubscriptions();
        refreshUser();
      } else {
        alert(data.message || 'Cancel failed');
      }
    } catch (err) {
      console.error('Cancel sub error:', err);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131722] border border-[#1f2638] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00aff0]/20 text-[#00aff0] flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Active Memberships</h1>
            <p className="text-xs text-gray-400">
              Manage your subscriptions, unlocked feeds, and renewal periods
            </p>
          </div>
        </div>

        <Link
          to="/explore"
          className="px-4 py-2.5 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Browse More Creators</span>
        </Link>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-[#131722] rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-[#131722] border border-[#1f2638] rounded-3xl p-12 text-center max-w-md mx-auto">
          <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No Active Subscriptions</h4>
          <p className="text-xs text-gray-400 mb-6">
            You haven't subscribed to any creator channels yet. Join a creator to unlock 4K video feeds and direct messaging.
          </p>
          <Link
            to="/explore"
            className="px-5 py-2.5 bg-[#00aff0] text-black font-bold text-xs rounded-xl shadow-lg"
          >
            Explore Channels
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub, idx) => (
            <div
              key={idx}
              className="bg-[#131722] border border-[#1f2638] hover:border-[#2b354d] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={sub.creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={sub.creator?.name || "Creator"}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00aff0]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-white">{sub.creator?.name || "Creator"}</h3>
                    {sub.creator?.verified && (
                      <CheckCircle2 className="w-4 h-4 text-[#00aff0] fill-[#00aff0]/20" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">@{sub.creator?.username} · {sub.creator?.category}</p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-bold text-[#00aff0] bg-[#00aff0]/10 px-2.5 py-0.5 rounded-full border border-[#00aff0]/30">
                      {sub.tier} Plan (${sub.price.toFixed(2)}/mo)
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Renews: {sub.expiresAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#1f2638]">
                <Link
                  to={`/creator/${sub.creator?.username || sub.creatorId}`}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#1a2133] hover:bg-[#252f48] text-gray-200 font-bold text-xs rounded-xl border border-[#2b354e] text-center transition"
                >
                  Visit Channel
                </Link>
                <button
                  onClick={() => handleCancelSub(sub.creatorId)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel Plan
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
