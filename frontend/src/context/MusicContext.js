import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchMusicHistoryApi, fetchMusicRecommendationApi } from '../services/musicApi';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const { token, user } = useAuth();
  const [song, setSong] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(user?.settings?.musicLanguage || 'mixed');
  const [musicType, setMusicType] = useState(user?.settings?.musicType || 'songs');

  useEffect(() => {
    setLanguage(user?.settings?.musicLanguage || 'mixed');
    setMusicType(user?.settings?.musicType || 'songs');
  }, [user?.settings?.musicLanguage, user?.settings?.musicType]);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    const result = await fetchMusicHistoryApi(token);
    if (result.success) setHistory(result.entries || []);
  }, [token]);

  const requestSong = useCallback(async ({ emotion, intensity, languageOverride, typeOverride }) => {
    if (!token) return { success: false, error: 'Please sign in to get music recommendations.' };
    setLoading(true);
    setError('');
    const result = await fetchMusicRecommendationApi(token, {
      emotion,
      intensity,
      language: languageOverride || language,
      type: typeOverride || musicType,
    });
    setLoading(false);
    if (result.success) {
      setSong(result.song);
      setHistory((current) => [result.song, ...current.filter((item) => item.videoId !== result.song.videoId)].slice(0, 20));
    } else {
      setError(result.error || 'No music recommendation is available right now.');
    }
    return result;
  }, [language, musicType, token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <MusicContext.Provider value={{
      song,
      history,
      loading,
      error,
      language,
      musicType,
      setLanguage,
      setMusicType,
      requestSong,
      loadHistory,
      clearSong: () => setSong(null),
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used inside MusicProvider');
  return context;
}
