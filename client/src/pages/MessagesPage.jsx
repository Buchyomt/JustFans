import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  DollarSign, 
  Lock, 
  CheckCircle2
} from 'lucide-react';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const creatorParam = searchParams.get('creator');

  const { currentUser, authFetch, updateBalance } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [inputText, setInputText] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [showTipBox, setShowTipBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/messages');
      const data = await res.json();
      if (data.success) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !activeThread) {
          // If a creatorParam was passed, select or target that thread
          if (creatorParam) {
            const match = data.threads.find(t => t.creatorId === creatorParam);
            if (match) setActiveThread(match);
            else setActiveThread(data.threads[0]);
          } else {
            setActiveThread(data.threads[0]);
          }
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !tipAmount) return;

    setSending(true);
    try {
      const threadId = activeThread ? activeThread.id : creatorParam;
      const res = await authFetch(`/api/messages/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          tip: tipAmount ? parseFloat(tipAmount) : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        if (activeThread) {
          const updatedMessages = [...activeThread.messages, data.message];
          setActiveThread({ ...activeThread, messages: updatedMessages });
        }
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

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 bg-[#131722] border border-[#1f2638] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Threads Column */}
        <div className="w-full md:w-80 border-r border-[#1f2638] flex flex-col bg-[#0e121b]/40">
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
              <p className="text-xs text-gray-500 text-center py-8">No message threads yet.</p>
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
                    src={t.partner?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={t.partner?.name || "User"}
                    className="w-12 h-12 rounded-full object-cover border border-[#00aff0]/50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {t.partner?.name}
                        {t.partner?.verified && <CheckCircle2 className="w-3 h-3 text-[#00aff0]" />}
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
          <div className="flex-1 flex flex-col bg-[#131722]">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-[#1f2638] flex items-center justify-between bg-[#111520]">
              <div className="flex items-center gap-3">
                <img
                  src={activeThread.partner?.avatar}
                  alt={activeThread.partner?.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#00aff0]"
                />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {activeThread.partner?.name}
                    {activeThread.partner?.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00aff0]" />
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-400">@{activeThread.partner?.username} · Active now</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTipBox(!showTipBox)}
                  className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-bold text-xs rounded-xl border border-amber-400/30 flex items-center gap-1 transition cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Tip in Chat</span>
                </button>
              </div>
            </div>

            {/* Message History Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeThread.messages?.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="max-w-[85%] sm:max-w-md">
                      
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
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
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
            </div>

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
                placeholder={tipAmount ? `Send message with $${tipAmount} tip...` : "Write a direct message..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#161c2b] border border-[#273148] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00aff0]"
              />
              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !tipAmount)}
                className="px-5 py-3 bg-[#00aff0] disabled:opacity-40 hover:bg-[#0094cc] text-black font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
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
            <p className="text-xs text-gray-400">Choose a creator from the left list or click "Chat" on any creator profile.</p>
          </div>
        )}

      </div>
    </div>
  );
}
