import { BASE_URL } from './api';

async function musicRequest(token, path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return response.ok ? data : { success: false, error: data.error || 'Music service unavailable.' };
  } catch (error) {
    return { success: false, error: error.message || 'Music service unavailable.' };
  }
}

export function fetchMusicRecommendationApi(token, { emotion, intensity, language, type }) {
  const params = new URLSearchParams({ emotion, intensity: String(intensity), language, type });
  return musicRequest(token, `/api/music/recommendation?${params.toString()}`);
}

export function fetchMusicHistoryApi(token) {
  return musicRequest(token, '/api/music/history');
}
