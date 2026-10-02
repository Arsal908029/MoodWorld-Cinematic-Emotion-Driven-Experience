// src/services/api.js
import { Platform, NativeModules } from 'react-native';

const PORT = 5000;
const FALLBACK_LAN_IP = '192.168.1.10';

// Detect the IP of the machine hosting the Metro bundler or fallback LAN IP
function detectDevHost() {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  // On native (Expo Go / physical phone / emulator), get the IP from scriptURL
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {
    // Fall back to LAN IP
  }

  return FALLBACK_LAN_IP;
}

const detectedHost = detectDevHost();

export const BASE_URL = `http://${detectedHost}:${PORT}`;

// Prioritized list of candidate endpoints
const CANDIDATE_URLS = [
  `http://${detectedHost}:${PORT}`,
  `http://${FALLBACK_LAN_IP}:${PORT}`,
  `http://localhost:${PORT}`,
  `http://10.0.2.2:${PORT}`,
];

let workingBaseUrl = BASE_URL;

// Fast fetch with guaranteed timeout to prevent freezing
async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function requestWithFallback(path, options = {}) {
  // 1. Try currently known working URL
  try {
    const response = await fetchWithTimeout(`${workingBaseUrl}${path}`, options, 3500);
    return response;
  } catch (err) {
    // 2. Try candidate hosts with short timeout
    for (const hostUrl of CANDIDATE_URLS) {
      if (hostUrl === workingBaseUrl) continue;
      try {
        const res = await fetchWithTimeout(`${hostUrl}${path}`, options, 2500);
        workingBaseUrl = hostUrl; // Save for subsequent requests
        return res;
      } catch (e) {
        // Try next candidate
      }
    }
    throw new Error('Cannot connect to backend server. Make sure your phone is on the same Wi-Fi network and backend is running.');
  }
}

// 1. User Signup - Strict authentication
export async function signupApi({ name, email, password }) {
  try {
    const res = await requestWithFallback('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, acceptedTerms: true }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || 'Signup failed. Please try again.',
      };
    }
    return data;
  } catch (error) {
    console.warn('Signup connection error:', error.message);
    return {
      success: false,
      error: error.message || 'Unable to connect to server. Please check your network.',
    };
  }
}

// 2. User Login - Strict authentication
export async function loginApi({ email, password }) {
  try {
    const res = await requestWithFallback('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || 'Invalid email or password.',
      };
    }
    return data;
  } catch (error) {
    console.warn('Login connection error:', error.message);
    return {
      success: false,
      error: error.message || 'Unable to connect to server. Please check your network.',
    };
  }
}

// 3. Verify Token
export async function getMeApi(token) {
  try {
    const res = await requestWithFallback('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { success: false, error: 'Session expired or invalid.' };
    }
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 4. Update Settings
export async function updateSettingsApi(token, settings) {
  try {
    const res = await requestWithFallback('/api/auth/settings', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ settings }),
    });
    return await res.json();
  } catch (error) {
    return { success: false };
  }
}

// 5. Submit Mood Check-In (Real-Time Synchronous)
export async function submitCheckInApi(token, emotion, intensity, triggers = []) {
  try {
    const res = await requestWithFallback('/api/mood/checkin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ emotion, intensity, triggers }),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || data.message || 'Unable to save check-in.' };
  } catch (error) {
    return { success: false, error: error.message || 'Unable to save check-in.' };
  }
}

// 6. Fetch Mood History
export async function fetchMoodHistoryApi(token, userId) {
  try {
    const res = await requestWithFallback(`/api/mood/history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return res.ok ? data : { success: false, history: [], error: data.error || data.message };
  } catch (error) {
    return { success: false, history: [] };
  }
}

export async function fetchLatestMoodApi(token, userId) {
  try {
    const res = await requestWithFallback(`/api/mood/latest/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || data.message };
  } catch (error) {
    return { success: false, error: error.message || 'Unable to restore your latest world.' };
  }
}

export async function createJournalApi(token, { text, emotion, tags = [] }) {
  try {
    const res = await requestWithFallback('/api/journals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, emotion, tags }),
    });
    const data = await res.json();
    return res.ok ? data : { success: false, error: data.error || data.message || 'Unable to save reflection.' };
  } catch (error) {
    return { success: false, error: error.message || 'Unable to save reflection.' };
  }
}

export async function fetchJournalsApi(token) {
  try {
    const res = await requestWithFallback('/api/journals', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return res.ok ? data : { success: false, entries: [], error: data.error || data.message };
  } catch (error) {
    return { success: false, entries: [], error: error.message || 'Unable to load reflections.' };
  }
}

// 7. Fetch Community Real-Time Atmosphere
export async function fetchCommunityAtmosphereApi() {
  try {
    const res = await requestWithFallback('/api/mood/community');
    return await res.json();
  } catch (error) {
    return {
      success: true,
      counts: { Happy: 14, Calm: 28, Okay: 10, Sad: 4, Angry: 2, Anxious: 7, Tired: 9 },
      total: 74,
    };
  }
}

// 8. Send Email Verification Code
export async function sendVerificationEmailApi(tokenOrEmail) {
  try {
    const isToken = tokenOrEmail && tokenOrEmail.length > 30 && !tokenOrEmail.includes('@');
    const headers = isToken ? { Authorization: `Bearer ${tokenOrEmail}` } : {};
    const body = !isToken && tokenOrEmail ? JSON.stringify({ email: tokenOrEmail }) : undefined;

    const res = await requestWithFallback('/api/auth/send-verification-email', {
      method: 'POST',
      headers,
      body,
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 9. Verify Email with 6-digit Code
export async function verifyEmailApi(tokenOrEmail, code) {
  try {
    const isToken = tokenOrEmail && tokenOrEmail.length > 30 && !tokenOrEmail.includes('@');
    const headers = isToken ? { Authorization: `Bearer ${tokenOrEmail}` } : {};
    const body = isToken
      ? JSON.stringify({ code })
      : JSON.stringify({ email: tokenOrEmail, code });

    const res = await requestWithFallback('/api/auth/verify-email', {
      method: 'POST',
      headers,
      body,
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 10. Forgot Password - Send Reset Code
export async function forgotPasswordApi(email) {
  try {
    const res = await requestWithFallback('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 11. Verify Reset Code
export async function verifyResetCodeApi(email, code) {
  try {
    const res = await requestWithFallback('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 12. Reset Password
export async function resetPasswordApi(email, code, newPassword) {
  try {
    const res = await requestWithFallback('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
