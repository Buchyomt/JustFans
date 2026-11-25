import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, requireCreator = false }) {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00aff0] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400 font-semibold tracking-wide">Verifying Secure Session...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to login page with return path
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If the route strictly requires creator role (e.g., Studio / Uploads)
  if (requireCreator && currentUser.role !== 'creator') {
    return (
      <div className="flex-1 max-w-lg mx-auto w-full p-6 my-12 text-center">
        <div className="bg-[#131722] border border-[#273148] rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00aff0] to-[#8b5cf6] p-0.5 mx-auto mb-4">
            <div className="w-full h-full bg-[#131722] rounded-[14px] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#00aff0]" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Creator Account Required</h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            You are logged in as <span className="text-white font-bold">@{currentUser.username}</span> (Fan Account). Uploading 4K videos, paywalled media, and viewing revenue studio analytics is reserved for Creator accounts.
          </p>
          <div className="space-y-3">
            <Link
              to="/feed"
              className="w-full py-3 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Feed & Creators</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

