import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  DollarSign, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Check
} from 'lucide-react';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const creatorParam = searchParams.get('creator') || 'creator-1';
  const inquiryParam = searchParams.get('inquiry');
  const tierParam = searchParams.get('tier');

  const { currentUser, authFetch, updateBalance } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [inputText, setInputText] = useState(
    inquiryParam === 'subscribe' 
      ? `Hi Nicole! I'd like to subscribe to your VIP channel ($60/mo). What payment method should I use to send the money?`
      : ''
  );
  const [tipAmount, setTipAmount] = useState('');
  const [showTipBox, setShowTipBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [granting, setGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/messages');
      const data = await res.json();
      if (data.success && data.threads) {
        setThreads(data.threads);

        // Determine active thread
        if (data.threads.length > 0) {
          let target = null;
          if (creatorParam) {
            target = data.threads.find(t => 
              t.creatorId === creatorParam || 
              t.partner?.id === creatorParam || 
              t.partner?.username === creatorParam
            );
          }
          setActiveThread(target || data.threads[0]);
        } else {
          // Fallback initial thread with Nicole Shayla if list is empty
          const fallbackThread = {
            id: 'creator-1',
            creatorId: 'creator-1',
            fanId: currentUser?.id || 'fan',
            partner: {
              id: 'creator-1',
              name: 'Nicole Shayla',
              username: 'uni_ques78',
              avatar: '/FhNtifmVQAEZDgwy.jpg',
              verified: true,
              role: 'creator'
            },
            messages: [
              {
                id: 'm-welcome',
                senderId: 'creator-1',
                text: "Hey babe! 💕 Welcome to my exclusive VIP chat. If you're looking to subscribe ($60/mo) and unlock my full uncut 4K video vault, message me right here to get my approved CashApp, PayPal, Zelle, or Crypto details! 😈",
                timestamp: new Date().toISOString()
              }
            ]
          };
          setThreads([fallbackThread]);
          setActiveThread(fallbackThread);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !tipAmount) return;

    const messageText = inputText.trim();
    const currentTip = tipAmount ? parseFloat(tipAmount) : 0;
    setSending(true);

    try {
      const targetId = activeThread ? (activeThread.id || activeThread.creatorId) : (creatorParam || 'creator-1');
      const res = await authFetch(`/api/messages/${targetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          tip: currentTip
        })
      });
      const data = await res.json();
      if (data.success) {
        const newMsgs = [...(activeThread?.messages || [])];
        if (data.message) newMsgs.push(data.message);
        if (data.autoReply) newMsgs.push(data.autoReply);

        const updatedThread = {
          ...activeThread,
          id: data.threadId || activeThread?.id || `thread-${Date.now()}`,
          messages: newMsgs,
          lastMessage: (data.autoReply || data.message)?.text,
          lastTimestamp: new Date().toISOString()
        };

        setActiveThread(updatedThread);
        setThreads(prev => {
          const exists = prev.some(t => t.id === updatedThread.id || t.creatorId === updatedThread.creatorId);
          if (exists) {
            return prev.map(t => (t.id === updatedThread.id || t.creatorId === updatedThread.creatorId) ? updatedThread : t);
          }
          return [updatedThread, ...prev];
        });

        if (data.newBalance !== undefined) {
          updateBalance(data.newBalance);
        }
        setInputText('');
        setTipAmount('');
        setShowTipBox(false);
      } else {
        alert(data.message || 'Error sending message');
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleGrantVIPAccess = async () => {
    if (!activeThread?.partner?.id) return;
    setGranting(true);
    setGrantSuccess('');
    try {
      const res = await authFetch('/api/subscriptions/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanId: activeThread.partner.id,
          creatorId: currentUser?.id || 'creator-1',
          tierName: 'Standard Fan'
        })
      });
      const data = await res.json();
      if (data.success) {
        setGrantSuccess(`VIP Access granted to @${activeThread.partner.username}!`);
        // Send a confirmation message in the chat
        await authFetch(`/api/messages/${activeThread.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🎉 VIP Access Activated! I've confirmed your payment and activated your full VIP vault access. Enjoy all 4K tapes babe! 💋`
          })
        });
        fetchThreads();
      } else {
        alert(data.message || 'Failed to grant access');
      }
    } catch (err) {
      console.error(err);
      alert('Error granting VIP access.');
    } finally {
      setGranting(false);
    }
  };

  const handleUnlockPPV = async (messageId) => {
    if (!activeThread) return;
    try {
      const res = await authFetch(`/api/messages/${activeThread.id}/unlock-ppv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      const data = await res.json();
      if (data.success) {
        const updatedMsgs = activeThread.messages.map(m => 
          m.id === messageId ? { ...m, unlocked: true } : m
        );
        setActiveThread({ ...activeThread, messages: updatedMsgs });
        updateBalance(data.newBalance);
      } else {
        alert(data.message || 'Unlock failed');
      }
    } catch (err) {
      console.error('PPV unlock error:', err);
    }
  };

  const isCreatorSelf = currentUser?.role === 'creator' || currentUser?.id === 'creator-1';

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 bg-[#131722] border border-[#1f2638] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Threads Column (Hidden on mobile if viewing active thread) */}
        <div className={`w-full md:w-80 border-r border-[#1f2638] flex flex-col bg-[#0e121b]/40 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#1f2638] flex items-center justify-between">
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00aff0]" />
              <span>Direct Messages</span>
            </h2>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
              {threads.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-xs text-gray-500 mb-3">No conversations started yet.</p>
                <button
                  onClick={() => {
                    fetchThreads();
                  }}
                  className="px-3 py-1.5 bg-[#00aff0] text-black text-xs font-bold rounded-xl"
                >
                  Chat with Nicole Shayla
                </button>
              </div>
            ) : (
              threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThread(t)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition cursor-pointer ${
                    activeThread?.id === t.id 
                      ? 'bg-[#1e273b] border border-[#00aff0]/40 shadow-sm' 
                      : 'hover:bg-[#161c2b] border border-transparent'
                  }`}
                >
                  <img
                    src={t.partner?.avatar || (t.partner?.id === 'creator-1' ? '/FhNtifmVQAEZDgwy.jpg' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100')}
                    alt={t.partner?.name || "User"}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {t.partner?.name}
                        {t.partner?.verified && <CheckCircle2 className="w-3 h-3 text-[#00aff0] flex-shrink-0" />}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {t.lastTimestamp ? new Date(t.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">
                      {t.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        {activeThread ? (
          <div className="flex-1 flex flex-col bg-[#131722] min-w-0">
            
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#1f2638] flex items-center justify-between bg-[#111520] gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveThread(null)}
                  className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1f2638]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={activeThread.partner?.avatar || (activeThread.partner?.id === 'creator-1' ? '/FhNtifmVQAEZDgwy.jpg' : '/FhNtifmVQAEZDgwy.jpg')}
                  alt={activeThread.partner?.name}
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-[#00aff0] flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5 truncate">
                    <span>{activeThread.partner?.name}</span>
                    {activeThread.partner?.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00aff0] flex-shrink-0" />
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate">
                    @{activeThread.partner?.username} · {activeThread.partner?.role === 'creator' ? 'VIP Creator' : 'Fan Member'}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Nicole Creator Control: Grant VIP access to this fan */}
                {isCreatorSelf && activeThread.partner?.role === 'fan' && (
                  <button
                    onClick={handleGrantVIPAccess}
                    disabled={granting}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-black font-black text-xs rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                    <span>{granting ? "Granting..." : "✨ Grant VIP Access"}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowTipBox(!showTipBox)}
                  className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-bold text-xs rounded-xl border border-amber-400/30 flex items-center gap-1 transition cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tip Creator</span>
                </button>
              </div>
            </div>

            {/* VIP Status Announcement Banner */}
            {grantSuccess && (
              <div className="px-4 py-2 bg-emerald-950/60 border-b border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{grantSuccess}</span>
              </div>
            )}

            {/* Nicole Payment Info Quick Bar for Fans */}
            {!isCreatorSelf && (activeThread.partner?.id === 'creator-1' || activeThread.creatorId === 'creator-1') && (
              <div className="px-4 py-2.5 bg-[#0e121b] border-b border-[#1f2638] flex items-center justify-between text-xs text-gray-300 gap-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-white">Accepted:</span>
                  <span className="text-[11px] text-gray-400">CashApp ($NicoleShaylaVIP) · PayPal · Zelle · Crypto</span>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded-full flex-shrink-0">
                  $60.00 / month VIP
                </span>
              </div>
            )}

            {/* Message History Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeThread.messages?.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="max-w-[88%] sm:max-w-md">
                      
                      {/* Attached Tip Banner if tipped */}
                      {msg.tip > 0 && (
                        <div className="mb-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                          <span>Attached a ${msg.tip.toFixed(2)} creator tip!</span>
                        </div>
                      )}

                      {/* Locked PPV Media Bubble */}
                      {msg.isLockedPPV ? (
                        <div className="bg-[#1b2233] border border-[#2e3a54] rounded-2xl p-4 shadow-xl">
                          <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black flex items-center justify-center">
                            {msg.unlocked ? (
                              <img
                                src={msg.attachmentUrl}
                                alt="Unlocked media"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <>
                                <img
                                  src={msg.attachmentUrl}
                                  alt="Locked PPV preview"
                                  className="w-full h-full object-cover filter blur-lg opacity-40 scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center">
                                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                                    <Lock className="w-5 h-5 text-[#00aff0]" />
                                  </div>
                                  <p className="text-xs font-bold text-white mb-2">Locked Pay-Per-View Message</p>
                                  <button
                                    onClick={() => handleUnlockPPV(msg.id)}
                                    className="px-4 py-1.5 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-full shadow-md transition"
                                  >
                                    Unlock for ${msg.price.toFixed(2)}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-200">{msg.text}</p>
                        </div>
                      ) : (
                        /* Standard Text Message */
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
                            isMe 
                              ? 'bg-gradient-to-r from-[#00aff0] to-[#0094cc] text-black font-medium rounded-tr-none' 
                              : 'bg-[#1b2233] text-gray-100 border border-[#2b364e] rounded-tl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      )}

                      <span className={`text-[10px] text-gray-500 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pill Shortcuts for Fans */}
            {!isCreatorSelf && (
              <div className="px-3 sm:px-4 py-2 bg-[#0e121b]/80 border-t border-[#1f2638] flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-gray-500 uppercase flex-shrink-0">Quick Ask:</span>
                <button
                  type="button"
                  onClick={() => setInputText("Hi Nicole! What is your payment method for VIP subscription?")}
                  className="px-2.5 py-1 bg-[#1a2133] hover:bg-[#252f47] text-gray-300 text-[11px] font-semibold rounded-full border border-[#2c3750] whitespace-nowrap transition cursor-pointer"
                >
                  💳 Ask Payment Method
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("Hey Nicole! I sent $60 via CashApp. My CashTag is: ")}
                  className="px-2.5 py-1 bg-[#1a2133] hover:bg-[#252f47] text-emerald-300 text-[11px] font-semibold rounded-full border border-emerald-800/40 whitespace-nowrap transition cursor-pointer"
                >
                  💸 Sent via CashApp
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("Hey Nicole! I sent $60 via Zelle. My payment email/name is: ")}
                  className="px-2.5 py-1 bg-[#1a2133] hover:bg-[#252f47] text-purple-300 text-[11px] font-semibold rounded-full border border-purple-800/40 whitespace-nowrap transition cursor-pointer"
                >
                  📱 Sent via Zelle
                </button>
                <button
                  type="button"
                  onClick={() => setInputText("Hey Nicole! I sent USDT for VIP vault access. TXID: ")}
                  className="px-2.5 py-1 bg-[#1a2133] hover:bg-[#252f47] text-amber-300 text-[11px] font-semibold rounded-full border border-amber-800/40 whitespace-nowrap transition cursor-pointer"
                >
                  ⚡ Sent Crypto
                </button>
              </div>
            )}

            {/* Tip In Chat Dropdown */}
            {showTipBox && (
              <div className="p-3 bg-[#111622] border-t border-[#1f2638] flex items-center gap-3">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Attach Tip:
                </span>
                {['5', '10', '25'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTipAmount(val)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      tipAmount === val ? 'bg-amber-400 text-black border-amber-400' : 'bg-[#1a2133] text-gray-300 border-[#2c364e]'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom $"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-24 bg-[#1a2133] border border-[#2c364e] rounded-xl px-2.5 py-1 text-xs text-white"
                />
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#1f2638] bg-[#0e121b] flex items-center gap-2">
              <input
                type="text"
                placeholder={tipAmount ? `Send message with $${tipAmount} tip...` : "Write a message to Nicole..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#161c2b] border border-[#273148] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00aff0]"
              />
              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !tipAmount)}
                className="px-5 py-3 bg-[#00aff0] disabled:opacity-40 hover:bg-[#0094cc] text-black font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#131722]">
            <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Select a Conversation</h4>
            <p className="text-xs text-gray-400 mb-4">Choose a creator from the left list or message Nicole directly.</p>
            <button
              onClick={() => {
                const target = threads.find(t => t.creatorId === 'creator-1') || threads[0];
                if (target) setActiveThread(target);
              }}
              className="px-4 py-2 bg-[#00aff0] text-black font-extrabold text-xs rounded-xl shadow-lg"
            >
              Chat with Nicole Shayla
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
