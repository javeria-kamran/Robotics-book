import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// API Configuration - use localhost for development
let API_URL = '';

function getApiUrl(): string {
  if (API_URL) return API_URL; // Return cached value
  
  if (typeof window === 'undefined') {
    return 'https://robotics-book-production-8e3d.up.railway.app';
  }
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_URL = 'http://localhost:8000';
  } else {
    // For production, use the Railway backend
    API_URL = 'https://robotics-book-production-8e3d.up.railway.app';
  }
  
  return API_URL;
}


interface User {
  id: number;
  email: string;
  name: string;
  software_level: string;
  hardware_level: string;
  programming_languages: string;
  robotics_experience: string;
  chat_messages_used: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  software_level: string;
  hardware_level: string;
  programming_languages: string;
  robotics_experience: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    console.log('AuthContext: Initializing, API_URL:', getApiUrl());
    
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      console.log('AuthContext: Found stored token, fetching user');
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      console.log('AuthContext: No stored token, skipping user fetch');
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const url = `${getApiUrl()}/auth/me`;
      console.log('AuthContext: Fetching user from', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext: User fetched successfully:', userData.email);
        setUser(userData);
      } else {
        console.warn('AuthContext: User fetch returned status', response.status);
        // Token invalid, clear it
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('AuthContext: Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Sign in failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('auth_token', result.token);
        setToken(result.token);
        setUser(result.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Sign up failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        await fetch(`${getApiUrl()}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { getApiUrl };
