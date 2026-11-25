import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
  const isLandingPage = location.pathname === '/';

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
