import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Content",
  itemName = "",
  itemType = "post",
  isLoading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#16131f] via-[#121622] to-[#0d1017] border border-rose-900/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-rose-950/30 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-[#182030]/60 hover:bg-[#202b40] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pulsing Warning Badge */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-rose-500/20 animate-ping opacity-60"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-950/80 to-rose-900/40 border border-rose-600/50 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/50">
            <Trash2 className="w-7 h-7" />
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-700/40 text-rose-300 text-[10px] font-black uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Permanent Deletion</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {title}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
            This action cannot be undone. Are you sure you want to permanently delete this {itemType}?
          </p>
        </div>

        {/* Target Item Preview Box */}
        {itemName && (
          <div className="p-3 bg-[#0a0d14] border border-[#232b3f] rounded-2xl text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-900/30 text-rose-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {itemType === 'video' ? '🎬' : '📝'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Target {itemType}</p>
              <p className="text-xs font-bold text-gray-200 truncate">
                {itemName}
              </p>
            </div>
          </div>
        )}

        {/* Warning Note */}
        <p className="text-[11px] text-rose-300/80 bg-rose-950/30 border border-rose-900/30 p-2.5 rounded-xl leading-relaxed">
          ⚠️ All associated video media, comments, and viewer unlocks will be permanently removed from JustFans.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 px-4 bg-[#161c2b] hover:bg-[#1f283d] border border-[#2a3750] text-gray-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="py-3 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
