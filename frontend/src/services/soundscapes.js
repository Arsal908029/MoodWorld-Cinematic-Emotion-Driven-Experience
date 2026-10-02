export const soundscapes = {
  Happy: { name: 'Sunrise drift', base: 220, drift: 18 },
  Calm: { name: 'Ocean hush', base: 180, drift: 10 },
  Okay: { name: 'Cloud room', base: 160, drift: 8 },
  Sad: { name: 'Rain loop', base: 120, drift: 6 },
  Angry: { name: 'Storm pulse', base: 90, drift: 14 },
  Anxious: { name: 'Fog hum', base: 140, drift: 7 },
  Tired: { name: 'Night wind', base: 100, drift: 5 },
};

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  return AudioCtor ? new AudioCtor() : null;
}

export function playMoodSoundscape(mood = 'Calm') {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const config = soundscapes[mood] || soundscapes.Calm;
  const base = config.base;
  const now = ctx.currentTime;

  const oscA = ctx.createOscillator();
  oscA.type = 'sine';
  oscA.frequency.setValueAtTime(base, now);
  oscA.frequency.linearRampToValueAtTime(base + config.drift, now + 0.5);

  const oscB = ctx.createOscillator();
  oscB.type = 'triangle';
  oscB.frequency.setValueAtTime(base * 1.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

  oscA.connect(gain);
  oscB.connect(gain);
  gain.connect(ctx.destination);

  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + 0.9);
  oscB.stop(now + 0.9);

  setTimeout(() => {
    try { ctx.close(); } catch (_) {}
  }, 1200);

  return config.name;
}

export function playBreathingCue(phase = 'Breathe in', mood = 'Calm') {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const config = soundscapes[mood] || soundscapes.Calm;
  const base = config.base + (phase === 'Breathe in' ? 14 : phase === 'Hold' ? 8 : -10);
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = phase === 'Hold' ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(base, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.03, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.45);

  setTimeout(() => {
    try { ctx.close(); } catch (_) {}
  }, 700);

  return phase;
}
