import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const switchDemo = async (userId) => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Switch demo failed:', err);
    }
    return false;
  };

  const updateBalance = (newBalance) => {
    setCurrentUser(prev => prev ? { ...prev, walletBalance: newBalance } : prev);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      refreshUser: fetchCurrentUser,
      switchDemo,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
