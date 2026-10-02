// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signupApi,
  loginApi,
  getMeApi,
  updateSettingsApi,
  submitCheckInApi,
  fetchLatestMoodApi,
  sendVerificationEmailApi,
  verifyEmailApi,
  forgotPasswordApi,
  verifyResetCodeApi,
  resetPasswordApi,
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestMood, setLatestMood] = useState(null);

  // Restore authenticated session on startup
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@moodworld_token');

        if (storedToken) {
          // Verify with backend
          const meRes = await getMeApi(storedToken);
          if (meRes.success && meRes.user) {
            setToken(storedToken);
            setUser(meRes.user);
            const latestRes = await fetchLatestMoodApi(storedToken, meRes.user._id);
            if (latestRes.success && latestRes.entry) {
              setLatestMood({ entry: latestRes.entry, worldState: latestRes.worldState });
            }
            await AsyncStorage.setItem('@moodworld_user', JSON.stringify(meRes.user));
          } else {
            // Invalid or expired token - purge session
            console.warn('Stored session invalid or expired, resetting auth state.');
            await AsyncStorage.multiRemove(['@moodworld_token', '@moodworld_user']);
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error('Failed to load user session', e);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const signup = async ({ name, email, password }) => {
    const res = await signupApi({ name, email, password });
    if (res.success) {
      if (res.requiresVerification) {
        // Return verification requirement without activating session yet
        return {
          success: true,
          requiresVerification: true,
          user: res.user,
          message: res.message,
        };
      }
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('@moodworld_token', res.token);
        await AsyncStorage.setItem('@moodworld_user', JSON.stringify(res.user));
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to sign up.' };
  };

  const login = async ({ email, password }) => {
    const res = await loginApi({ email, password });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      await AsyncStorage.setItem('@moodworld_token', res.token);
      await AsyncStorage.setItem('@moodworld_user', JSON.stringify(res.user));
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid credentials.' };
  };

  const logoutUser = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['@moodworld_token', '@moodworld_user']);
  };

  const updateSettings = async (newSettings) => {
    if (token) {
      const res = await updateSettingsApi(token, newSettings);
      if (res.success && res.user) {
        setUser(res.user);
        await AsyncStorage.setItem('@moodworld_user', JSON.stringify(res.user));
        return;
      }
    }
    // Local update fallback
    if (user) {
      const updated = {
        ...user,
        settings: { ...(user.settings || {}), ...newSettings },
      };
      setUser(updated);
      await AsyncStorage.setItem('@moodworld_user', JSON.stringify(updated));
    }
  };

  const recordCheckIn = async (emotion, intensity, triggers = []) => {
    if (!token) {
      return { success: false, error: 'Please sign in before checking in.' };
    }
    const res = await submitCheckInApi(token, emotion, intensity, triggers);

    if (!res.success) {
      return res;
    }

    if (user) {
      const updated = {
        ...user,
        currentMood: emotion,
        streak: res.streak !== undefined ? res.streak : (user.streak || 0) + 1,
        lastCheckIn: new Date(),
      };
      setUser(updated);
      await AsyncStorage.setItem('@moodworld_user', JSON.stringify(updated));
    }

    return res;
  };

  const sendVerificationEmail = async (targetTokenOrEmail) => {
    const target = targetTokenOrEmail || token;
    if (!target) return { success: false, error: 'Email or token required.' };
    return await sendVerificationEmailApi(target);
  };

  const verifyEmail = async (code, targetTokenOrEmail) => {
    const target = targetTokenOrEmail || token;
    const res = await verifyEmailApi(target, code);
    if (res.success && res.user) {
      if (res.token) {
        setToken(res.token);
        await AsyncStorage.setItem('@moodworld_token', res.token);
      }
      setUser(res.user);
      await AsyncStorage.setItem('@moodworld_user', JSON.stringify(res.user));
    }
    return res;
  };

  const forgotPassword = async (email) => {
    return await forgotPasswordApi(email);
  };

  const verifyResetCode = async (email, code) => {
    return await verifyResetCodeApi(email, code);
  };

  const resetPassword = async (email, code, newPassword) => {
    return await resetPasswordApi(email, code, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        latestMood,
        signup,
        login,
        logoutUser,
        updateSettings,
        recordCheckIn,
        sendVerificationEmail,
        verifyEmail,
        forgotPassword,
        verifyResetCode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;