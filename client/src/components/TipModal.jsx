import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, X, Sparkles } from 'lucide-react';

export default function TipModal({ post, creator, onClose, onTipSuccess }) {
  const { currentUser, updateBalance } = useAuth();
  const [amount, setAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const targetCreator = creator || post?.creator;
  const currentBalance = currentUser?.walletBalance || 0;

  const handleSendTip = async () => {
    setError('');
    const finalAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Please select or enter a valid tip amount.');
      return;
    }

    if (currentBalance < finalAmount) {
      setError(`Insufficient wallet funds ($${currentBalance.toFixed(2)}). Please add funds in the top bar.`);
      return;
    }

    setIsSubmitting(true);
    try {
      let endpoint = post ? `/api/posts/${post.id}/tip` : `/api/creators/${targetCreator.id}/tip`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, message })
      });
      const data = await res.json();
      if (data.success) {
        updateBalance(data.newBalance);
        onTipSuccess(finalAmount);
        onClose();
      } else {
        setError(data.message || 'Tip failed');
      }
    } catch (err) {
      setError('Network error while processing tip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Send Tip to Creator</h3>
            <p className="text-xs text-gray-400">
              Supporting <span className="text-[#00aff0] font-semibold">@{targetCreator?.username || 'creator'}</span>
            </p>
          </div>
        </div>

        {/* Preset Amounts */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Select Tip Amount
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['5', '10', '25', '50'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAmount(val);
                  setCustomAmount('');
                }}
                className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                  amount === val && !customAmount
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#1a2133] text-gray-300 border-[#2b354e] hover:border-gray-400'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Or Custom Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 75"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount('');
              }}
              className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Optional Fan Note */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Add a Personal Note (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Keep making amazing content! 🔥"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#1a2133] border border-[#2b354e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Balance Status */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 p-2.5 bg-[#0e121b] rounded-xl border border-[#22293d]">
          <span>Your Wallet Balance:</span>
          <span className="font-bold text-white">${currentBalance.toFixed(2)}</span>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50 mb-4">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSendTip}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>{isSubmitting ? "Processing..." : `Send $${customAmount || amount}.00 Tip`}</span>
        </button>

      </div>
    </div>
  );
}
