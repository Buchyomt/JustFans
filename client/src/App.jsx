import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import CreatorStudioPage from './pages/CreatorStudioPage';
import MessagesPage from './pages/MessagesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import BookmarksPage from './pages/BookmarksPage';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-[#00aff0] selection:text-black">
          {/* Top Global Navbar */}
          <Navbar />

          {/* Main App Body with Responsive Sidebar and Content View */}
          <div className="flex-1 flex w-full">
            <Sidebar />

            <main className="flex-1 min-w-0 pb-20 md:pb-8">
              <Routes>
                {/* Public Browsing Routes */}
                <Route path="/" element={<FeedPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/creator/:username" element={<CreatorProfilePage />} />
                
                {/* Authentication Routes (Vanilla CSS Forms) */}
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
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
