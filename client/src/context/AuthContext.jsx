import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'justfans_auth_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticated fetch wrapper that automatically injects the Bearer JWT token
  const authFetch = async (url, options = {}) => {
    const headers = { ...options.headers };
    const activeToken = token || localStorage.getItem(TOKEN_KEY);
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return fetch(url, { ...options, headers });
  };

  const fetchCurrentUser = async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setToken(activeToken);
      } else {
        // Token was invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Signup action
  const signup = async (formData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Signup failed' };
    } catch {
      return { success: false, message: 'Network connection failed during signup' };
    }
  };

  // Login action
  const login = async (credentials) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Network error during login' };
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  // Switch demo test account
  const switchDemo = async (userId) => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
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
      token,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      loading,
      login,
      signup,
      logout,
      authFetch,
      refreshUser: fetchCurrentUser,
      switchDemo,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
