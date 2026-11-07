import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, ShieldCheck, Sparkles, Star } from 'lucide-react';

export default function SubscribeModal({ creator, onClose, onSubscribeSuccess }) {
  const { currentUser, authFetch, updateBalance } = useAuth();
  const [selectedTier, setSelectedTier] = useState(creator.tiers?.[0] || {
    name: "Standard Membership",
    price: creator.monthlyPrice || 9.99,
    perks: [
      "Access to full video and photo archives",
      "Direct message chat privileges",
      "Exclusive subscriber livestreams"
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentBalance = currentUser?.walletBalance || 0;
  const tiers = creator.tiers || [selectedTier];

  const handleSubscribe = async () => {
    setError('');
    const cost = selectedTier.price;

    if (currentBalance < cost) {
      setError(`Insufficient wallet balance ($${currentBalance.toFixed(2)}). Please add funds in the top bar.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: creator.id,
          tierName: selectedTier.name,
          price: selectedTier.price
        })
      });
      const data = await res.json();
      if (data.success) {
        updateBalance(data.newBalance);
        onSubscribeSuccess(data.subscription);
        onClose();
      } else {
        setError(data.message || 'Subscription failed');
      }
    } catch (err) {
      setError('Network error processing subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Creator Banner / Avatar */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#00aff0]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-lg text-white">{creator.name}</h3>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-xs text-gray-400">@{creator.username} · {creator.category}</p>
          </div>
        </div>

        {/* Tier Options */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Choose Membership Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tiers.map((t, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTier(t)}
                className={`p-4 rounded-2xl border cursor-pointer transition relative ${
                  selectedTier.name === t.name
                    ? 'bg-[#00aff0]/10 border-[#00aff0] shadow-md shadow-cyan-500/20'
                    : 'bg-[#181e2c] border-[#293349] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{t.name}</span>
                  {selectedTier.name === t.name && (
                    <div className="w-5 h-5 rounded-full bg-[#00aff0] text-black flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-lg font-black text-[#00aff0]">
                  ${t.price.toFixed(2)}<span className="text-xs text-gray-400 font-normal"> / mo</span>
                </p>
                <ul className="mt-2.5 space-y-1">
                  {t.perks?.map((p, pIdx) => (
                    <li key={pIdx} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-[#00aff0] mt-0.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet Balance Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 p-3 bg-[#0e121b] rounded-xl border border-[#22293d]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Access · Cancel Anytime</span>
          </div>
          <span className="font-semibold text-white">
            Wallet Balance: ${(currentUser?.walletBalance || 0).toFixed(2)}
          </span>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50 mb-4">
            {error}
          </p>
        )}

        {/* Subscribe Action */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubscribe}
          className="w-full py-3.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{isSubmitting ? "Activating..." : `Join ${selectedTier.name} for $${selectedTier.price.toFixed(2)} / month`}</span>
        </button>

      </div>
    </div>
  );
}

