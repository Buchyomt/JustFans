import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Check, 
  X, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Lock, 
  KeyRound,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SubscribeModal({ creator, onClose, onSubscribeSuccess }) {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  
  const [selectedTier, setSelectedTier] = useState(creator?.tiers?.[0] || {
    id: "tier-std",
    name: "Standard Fan",
    price: creator?.monthlyPrice || 60.00,
    perks: [
      "Full access to 4K uncensored video vault & feed",
      "Daily video drops & private feed",
      "Comment & like privileges on all posts"
    ]
  });

  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'code' | 'notify'
  const [vipCode, setVipCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState('');
  const [copiedMethod, setCopiedMethod] = useState('');

  const tiers = creator?.tiers || [
    {
      id: "tier-std",
      name: "Standard Fan",
      price: creator?.monthlyPrice || 60.00,
      perks: [
        "Full access to 4K uncensored video vault & feed",
        "Daily video drops & private feed",
        "Comment & like privileges on all posts"
      ]
    },
    {
      id: "tier-vip",
      name: "VIP All-Access",
      price: 99.00,
      perks: [
        "All Standard Fan perks",
        "Direct priority 1-on-1 private messaging",
        "Exclusive custom video requests discount",
        "Early access to full uncut 4K tapes"
      ]
    }
  ];

  const paymentMethods = [
    { 
      label: "CashApp", 
      tag: "Request Cashtag in DM", 
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
      hint: "Message Nicole to get active tag"
    },
    { 
      label: "Gift Cards", 
      tag: "Apple · Steam · Amazon · Visa", 
      color: "text-pink-400 bg-pink-950/40 border-pink-800/40",
      hint: "Send card code & receipt in DM"
    },
    { 
      label: "Crypto (USDT / BTC)", 
      tag: "TRC20: Request address in DM", 
      color: "text-amber-400 bg-amber-950/40 border-amber-800/40",
      hint: "Direct wallet address in DM"
    }
  ];

  const handleCopy = (tag, label) => {
    navigator.clipboard?.writeText(tag);
    setCopiedMethod(label);
    setTimeout(() => setCopiedMethod(''), 2000);
  };

  const handleGoToChat = () => {
    onClose();
    navigate(`/messages?creator=${creator?.id || 'creator-1'}&inquiry=subscribe&tier=${encodeURIComponent(selectedTier.name)}`);
  };

  const handleNotifyPayment = async () => {
    setNotifyLoading(true);
    setNotifySuccess('');
    try {
      const res = await authFetch(`/api/messages/${creator?.id || 'creator-1'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 PAYMENT NOTIFICATION: I would like to subscribe to the ${selectedTier.name} ($${selectedTier.price.toFixed(2)}/mo). Please send your preferred payment details or verify my transaction so I can get VIP access!`
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotifySuccess(`Notification dispatched to Nicole's inbox! Check your Messages tab for her reply and payment instructions.`);
      } else {
        alert(data.message || 'Failed to dispatch payment notification.');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with server.');
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!vipCode.trim()) return;
    setCodeLoading(true);
    setCodeError('');
    try {
      const res = await authFetch('/api/subscriptions/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: vipCode,
          creatorId: creator?.id || 'creator-1'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onSubscribeSuccess) onSubscribeSuccess(data.subscription);
        onClose();
      } else {
        setCodeError(data.message || 'Invalid VIP code.');
      }
    } catch (_err) {
      setCodeError('Network error verifying code.');
    } finally {
      setCodeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#131722] border border-[#2b354e] rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl relative my-auto animate-in fade-in zoom-in duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-[#1f2638] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Creator Banner / Avatar */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#1f2638]">
          <img
            src={creator?.avatar || "/FhNtifmVQAEZDgwy.jpg"}
            alt={creator?.name || "Nicole Shayla"}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-white truncate">{creator?.name || "Nicole Shayla"}</h3>
              <CheckCircle2 className="w-4 h-4 text-[#00aff0] fill-[#00aff0]/20 flex-shrink-0" />
              <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                Official VIP
              </span>
            </div>
            <p className="text-xs text-gray-400">@{creator?.username || "uni_ques78"} · {creator?.category || "Trans & Solo VIP"}</p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Select Membership Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tiers.map((t) => (
              <div
                key={t.id || t.name}
                onClick={() => setSelectedTier(t)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                  selectedTier.name === t.name
                    ? 'bg-gradient-to-br from-[#00aff0]/15 via-purple-600/15 to-transparent border-[#00aff0] shadow-md shadow-cyan-500/10'
                    : 'bg-[#181e2c] border-[#293349] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs sm:text-sm text-white">{t.name}</span>
                  {selectedTier.name === t.name && (
                    <div className="w-4 h-4 rounded-full bg-[#00aff0] text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-base sm:text-lg font-black text-[#00aff0]">
                  ${t.price.toFixed(2)}<span className="text-[11px] text-gray-400 font-normal"> / mo</span>
                </p>
                <ul className="mt-2 space-y-1">
                  {t.perks?.slice(0, 2).map((p, pIdx) => (
                    <li key={pIdx} className="text-[11px] text-gray-300 flex items-start gap-1">
                      <Check className="w-3 h-3 text-[#00aff0] mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Notice: Content Locked Until Payment Verified */}
        <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-2xl mb-4 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300">Direct Payment Required: </strong> 
            To unlock Nicole's uncut 4K video feed, payment is processed directly with Nicole via her payment methods. Content remains locked until confirmed.
          </div>
        </div>

        {/* Tab Switcher: Contact Nicole vs Enter VIP Code */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-[#0e121b] rounded-2xl border border-[#22293d]">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'contact'
                ? 'bg-[#1f273b] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#00aff0]" />
            <span>1. Contact For Payment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-[#1f273b] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>2. Enter VIP Code</span>
          </button>
        </div>

        {/* Tab 1: Contact Nicole & Payment Info */}
        {activeTab === 'contact' && (
          <div className="space-y-3.5">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Nicole's Approved Payment Accounts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentMethods.map((pm, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopy(pm.tag, pm.label)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer hover:border-gray-400 transition ${pm.color}`}
                    title="Click to copy"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">{pm.label}</span>
                      <span className="text-xs font-black truncate block text-white">{pm.tag}</span>
                    </div>
                    <div className="flex-shrink-0 text-gray-400">
                      {copiedMethod === pm.label ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {notifySuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{notifySuccess}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleGoToChat}
                className="w-full py-3.5 bg-gradient-to-r from-[#00aff0] via-[#8b5cf6] to-[#ec4899] hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Nicole to Ask for Payment Method</span>
              </button>

              <button
                type="button"
                disabled={notifyLoading}
                onClick={handleNotifyPayment}
                className="w-full py-2.5 bg-[#1b2336] hover:bg-[#25304a] text-gray-200 border border-[#2e3b57] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#00aff0]" />
                <span>{notifyLoading ? "Sending Notification..." : "I've Sent Payment (Notify Nicole in Chat)"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Redeem VIP Code */}
        {activeTab === 'code' && (
          <form onSubmit={handleRedeemCode} className="space-y-3.5">
            <div className="bg-[#0e121b] border border-[#22293d] rounded-2xl p-4 text-xs text-gray-300 space-y-1.5 leading-relaxed">
              <p className="font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Received your VIP Code from Nicole in Chat?</span>
              </p>
              <p className="text-gray-400">
                After you make payment via CashApp, Gift Cards, or Crypto, Nicole will message you a VIP activation code (e.g. <code className="text-[#00aff0] font-mono font-bold">VIP60</code>) to instantly unlock all 4K videos.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Enter VIP Activation Code
              </label>
              <input
                type="text"
                placeholder="e.g. VIP60"
                value={vipCode}
                onChange={(e) => setVipCode(e.target.value.toUpperCase())}
                className="w-full bg-[#181e2c] border border-[#2b354e] rounded-xl px-4 py-3 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-[#00aff0]"
              />
            </div>

            {codeError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{codeError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={codeLoading || !vipCode.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] disabled:opacity-40 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{codeLoading ? "Verifying..." : "Activate VIP Access & Unlock Feed"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
