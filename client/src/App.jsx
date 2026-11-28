import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import FeedPage from './pages/FeedPage';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import CreatorStudioPage from './pages/CreatorStudioPage';
import MessagesPage from './pages/MessagesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import BookmarksPage from './pages/BookmarksPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import Footer from './components/Footer';



function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);
  const isLandingPage = location.pathname === '/';

  // Global handler for Google OAuth full-page redirect callback (critical for mobile Chrome & Brave)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');

      if (idToken) {
        setOauthLoading(true);
        try {
          const payloadBase64 = idToken.split('.')[1];
          const decodedStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(decodeURIComponent(escape(decodedStr)));
          loginWithGoogle({
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture,
            role: 'fan',
            credential: idToken
          }).then((res) => {
            window.history.replaceState(null, '', window.location.pathname);
            if (res.success) {
              navigate(res.user?.role === 'creator' ? '/studio' : '/feed');
            }
          }).finally(() => setOauthLoading(false));
        } catch (e) {
          console.error('Mobile Google id_token parse error:', e);
          setOauthLoading(false);
        }
      } else if (accessToken) {
        setOauthLoading(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(r => r.json())
          .then(async (info) => {
            if (info?.email) {
              const res = await loginWithGoogle({
                email: info.email,
                name: info.name || info.email.split('@')[0],
                picture: info.picture,
                role: 'fan'
              });
              window.history.replaceState(null, '', window.location.pathname);
              if (res.success) {
                navigate(res.user?.role === 'creator' ? '/studio' : '/feed');
              }
            }
          })
          .catch(e => console.error('OAuth profile fetch error:', e))
          .finally(() => setOauthLoading(false));
      }
    }
  }, []);

  if (oauthLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#00aff0] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-bold text-sm">Signing you in with Google...</p>
        <p className="text-gray-400 text-xs mt-1">Connecting your JustFans account</p>
      </div>
    );
  }

  // Landing Page is completely dedicated and full-width (its own standalone showcase)
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-[#00aff0] selection:text-black">
        <LandingPage />
        <Footer />
      </div>
    );
  }

  // All other app routes include the Top App Navbar, Responsive Sidebar, and Social Media experience
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-[#00aff0] selection:text-black">
      {/* Top Global Navbar */}
      <Navbar />

      {/* Main App Body with Responsive Sidebar and Content View */}
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          <Routes>
            {/* Live Social Media Feed & Creator Browsing */}
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/creator/:username" element={<CreatorProfilePage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/signup" element={<AuthPage initialMode="signup" />} />

            {/* Protected Upload & Creator Features */}
            <Route
              path="/studio"
              element={
                <ProtectedRoute requireCreator={true}>
                  <CreatorStudioPage />
                </ProtectedRoute>
              }
            />

            {/* Protected User Features */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute>
                  <BookmarksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      {/* Global Trust & Legal Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
