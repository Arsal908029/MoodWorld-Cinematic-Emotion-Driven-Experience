// src/services/api.js
const API_BASE_URL = 'http://10.0.2.2:5000/api/mood'; // Use 10.0.2.2 for Android Emulator or LAN IP for physical devices

export async function submitCheckIn(userId, emotion, intensity, triggers = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        emotion,
        intensity,
        triggers,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('API Error (submitCheckIn):', error);
    throw error;
  }
}

export async function fetchMoodHistory(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('API Error (fetchMoodHistory):', error);
    throw error;
  }
}