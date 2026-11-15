import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, FileText, CheckCircle2, X } from 'lucide-react';

export default function Footer() {
  const [modalContent, setModalContent] = useState(null); // 'terms' | 'privacy' | '2257' | 'dmca' | null

  return (
    <>
      <footer className="bg-[#0b0e14] border-t border-[#1f2638] text-gray-400 py-10 px-4 lg:px-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          
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
            <p>&copy; {new Date().getFullYear()} JustFans Inc. All rights reserved. Age 18+ strictly enforced.</p>
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
                  <p>Subscriptions renew every 30 days unless cancelled. Direct payments made to creator tags (CashApp, PayPal, Zelle) are processed directly with the creator.</p>
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
