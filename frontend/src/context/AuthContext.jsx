import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details from backend
  const fetchUserProfile = async (token) => {
    try {
      if (token) {
        localStorage.setItem('studyhub_token', token);
      }
      const res = await api.get('/profile');
      if (res.success && res.data) {
        if (res.data.status === 'inactive') {
          await logout();
          throw new Error('Your account has been deactivated. Please contact your administrator.');
        }
        setUser(res.data);
        return res.data;
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('deactivated')) {
        await logout();
        throw err;
      }
      console.warn('Could not fetch user profile from backend:', err.message);
    }
  };

  useEffect(() => {
    let subscription = null;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession) {
            setSession(initialSession);
            await fetchUserProfile(initialSession.access_token);
          } else {
            const cachedDemo = localStorage.getItem('studyhub_demo_user');
            if (cachedDemo) {
              try {
                setUser(JSON.parse(cachedDemo));
              } catch (e) {}
            }
          }

          const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setSession(newSession);
            if (newSession) {
              await fetchUserProfile(newSession.access_token);
            } else {
              const cachedDemo = localStorage.getItem('studyhub_demo_user');
              if (!cachedDemo) {
                localStorage.removeItem('studyhub_token');
                setUser(null);
              }
            }
          });
          subscription = data.subscription;
        } else {
          // If Supabase credentials are not yet entered, check if an existing session token is cached
          const cachedToken = localStorage.getItem('studyhub_token');
          if (cachedToken) {
            await fetchUserProfile(cachedToken);
          }
          const cachedDemo = localStorage.getItem('studyhub_demo_user');
          if (cachedDemo) {
            try {
              setUser(JSON.parse(cachedDemo));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data?.session) {
          setSession(data.session);
          localStorage.setItem('studyhub_token', data.session.access_token);
          const profile = await fetchUserProfile(data.session.access_token);
          if (profile?.status === 'inactive') {
            await logout();
            throw new Error('Your account has been deactivated. Please contact your administrator.');
          }
          return profile || data.user;
        } else if (error && error.message.toLowerCase().includes('deactivated')) {
          throw new Error('Your account has been deactivated. Please contact your administrator.');
        }
      } catch (sbErr) {
        if (sbErr.message && sbErr.message.toLowerCase().includes('deactivated')) {
          throw sbErr;
        }
        // If Supabase authentication returned invalid credentials or failed, check backend API fallback
      }
    }

    // 2. Call Backend Authentication endpoint
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        if (res.data.status === 'inactive') {
          throw new Error('Your account has been deactivated. Please contact your administrator.');
        }
        localStorage.setItem('studyhub_token', res.token);
        setUser(res.data);
        return res.data;
      }
    } catch (apiErr) {
      if (apiErr.message && apiErr.message.toLowerCase().includes('deactivated')) {
        throw new Error('Your account has been deactivated. Please contact your administrator.');
      }
      throw new Error(apiErr.message || 'Login failed. Please check your credentials.');
    }

    throw new Error('Login failed. Please check your credentials.');
  };

  const register = () => {
    throw new Error('Public student registration is disabled. Student accounts must be created by an administrator.');
  };


  const loginAsDemo = (role = 'student') => {
    const demoProfiles = {
      student: {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Priya Sharma (Demo Student)',
        email: 'student.demo@studyhub.edu',
        college: 'College of Engineering, Guindy',
        role: 'student',
        semester: 4,
        department: {
          id: 'a0000000-0000-0000-0000-000000000001',
          name: 'Computer Science and Engineering',
          code: 'CSE',
        },
        stats: {
          uploads: 3,
          bookmarks: 5,
          ratings: 4,
        },
      },
      moderator: {
        id: '22222222-2222-2222-2222-222222222222',
        full_name: 'David Chen (Demo Moderator)',
        email: 'moderator.demo@studyhub.edu',
        college: 'National Institute of Technology',
        role: 'moderator',
        semester: 6,
        department: {
          id: 'a0000000-0000-0000-0000-000000000002',
          name: 'CSE Cybersecurity',
          code: 'CSE-CYBER',
        },
        stats: {
          uploads: 8,
          bookmarks: 12,
          ratings: 15,
        },
      },
      admin: {
        id: '33333333-3333-3333-3333-333333333333',
        full_name: 'StudyHub Administrator',
        email: 'admin@studyhub.local',
        college: 'Anna University Campus',
        role: 'admin',
        status: 'active',
        semester: 8,
        department: {
          id: 'a0000000-0000-0000-0000-000000000001',
          name: 'Computer Science and Engineering',
          code: 'CSE',
        },
        stats: {
          uploads: 14,
          bookmarks: 20,
          ratings: 28,
        },
      },
    };

    const selectedProfile = demoProfiles[role] || demoProfiles.student;
    setUser(selectedProfile);
    localStorage.setItem('studyhub_demo_user', JSON.stringify(selectedProfile));
    localStorage.setItem('studyhub_token', `demo-token-${role}`);
    return selectedProfile;
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // Ignore api logout error if offline
      }
    } finally {
      localStorage.removeItem('studyhub_token');
      localStorage.removeItem('studyhub_demo_user');
      setSession(null);
      setUser(null);
    }
  };

  const updateUserProfile = async (updateData) => {
    const res = await api.put('/profile', updateData);
    if (res.success && res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
    }
    return res;
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    loginAsDemo,
    logout,
    updateUserProfile,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
