// src/theme/moodWorldTheme.js
// Single source of truth for the MoodWorld "Cinematic" design.

export const moods = {
  Happy:   { emoji: '😊', weather: 'Sunny',   env: 'Garden',    sky: ['#4aa8ff', '#ffc98a', '#fff0cf'], sun: '#fff6c9', ground: '#3d8a52', stars: 0,  clouds: 0.55, rainbow: 0,   sunOffset: 0,   particles: 'sparkles', music: 'Happy'  },
  Calm:    { emoji: '😌', weather: 'Rainbow', env: 'Beach',     sky: ['#3a6fd0', '#78cfd6', '#f6d8ee'], sun: '#ffffff', ground: '#2b6d80', stars: 0.1, clouds: 0.5,  rainbow: 0.6, sunOffset: 20,  particles: 'sparkles', music: 'Relax'  },
  Okay:    { emoji: '🙂', weather: 'Cloudy',  env: 'Forest',    sky: ['#7f95ad', '#aebccb', '#dde4ea'], sun: '#f4f6f8', ground: '#3f6553', stars: 0,  clouds: 0.95, rainbow: 0,   sunOffset: 10,  particles: 'none',     music: 'Focus'  },
  Sad:     { emoji: '😢', weather: 'Rainy',   env: 'Forest',    sky: ['#18233f', '#34466f', '#6a7fa8'], sun: '#9fb0d0', ground: '#131d33', stars: 0.2, clouds: 0.95, rainbow: 0,   sunOffset: 30,  particles: 'rain',     music: 'Sleep'  },
  Angry:   { emoji: '😠', weather: 'Stormy',  env: 'City',      sky: ['#170a1e', '#6b1a3a', '#e2553a'], sun: '#ffad84', ground: '#160c15', stars: 0.3, clouds: 0.9,  rainbow: 0,   sunOffset: 120, particles: 'rain',     music: 'Energy', lightning: true },
  Anxious: { emoji: '😰', weather: 'Foggy',   env: 'Mountains', sky: ['#454a78', '#8a8fb5', '#c9cbdf'], sun: '#eaeaf7', ground: '#2c2f50', stars: 0.1, clouds: 0.9,  rainbow: 0,   sunOffset: 40,  particles: 'fog',      music: 'Relax'  },
  Tired:   { emoji: '😴', weather: 'Snowy',   env: 'Space',     sky: ['#080a28', '#232a66', '#5a60ab'], sun: '#e3e6ff', ground: '#0e1030', stars: 1,  clouds: 0.25, rainbow: 0,   sunOffset: -20, particles: 'snow',     music: 'Sleep'  },
};

export const moodOrder = ['Happy', 'Calm', 'Okay', 'Sad', 'Angry', 'Anxious', 'Tired'];

// Procedural computation matching backend logic
export function worldFromMood(emotion, intensity) {
  const m = moods[emotion] || moods.Okay;
  return {
    ...m,
    fog: intensity > 6 ? 'high' : 'low',
    rainIntensity: (emotion === 'Sad' || emotion === 'Angry') ? intensity / 10 : 0,
    particleScale: 0.35 + intensity / 10,
  };
}

// Depth layer mixing definitions
export const depthMix = {
  far:  { with: 'sky[2]', ground: 0.4 },   // horizon 60% + ground 40%
  mid:  { with: 'sky[2]', ground: 0.75 },  // horizon 25% + ground 75%
  near: { with: '#000000', ground: 0.85 }, // ground 85% + black 15%
};

// Dynamic Time-of-Day Overlays
export const timeOfDay = {
  dawn:  { hours: [5, 8],   tint: '#ffb99a', tintOpacity: 0.12, brightness: 0.95, starsBoost: 0.1 },
  day:   { hours: [8, 17],  tint: null,      tintOpacity: 0,    brightness: 1,    starsBoost: 0   },
  dusk:  { hours: [17, 20], tint: '#ff8a5c', tintOpacity: 0.18, brightness: 0.85, starsBoost: 0.2 },
  night: { hours: [20, 5],  tint: '#0a0f3a', tintOpacity: 0.35, brightness: 0.6,  starsBoost: 0.6 },
};

export function currentTimeOfDay(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

export const fonts = {
  serif: 'Fraunces',
  sans: 'Sora',
  serifFallback: 'Georgia',
  sansFallback: 'System',
};

export const type = {
  hero:    { fontFamily: fonts.serif, fontSize: 60, fontWeight: '300', letterSpacing: -1.5 },
  title:   { fontFamily: fonts.serif, fontSize: 44, fontWeight: '300' },
  heading: { fontFamily: fonts.serif, fontSize: 26, fontWeight: '400' },
  body:    { fontFamily: fonts.sans,  fontSize: 13, fontWeight: '400' },
  button:  { fontFamily: fonts.sans,  fontSize: 15, fontWeight: '700' },
  label:   { fontFamily: fonts.sans,  fontSize: 10, fontWeight: '600' },
  chip:    { fontFamily: fonts.sans,  fontSize: 12, fontWeight: '600' },
};

export const space = { screenX: 22, screenTop: 56, screenBottom: 22, gap: 8, sheetPad: 18 };
export const radius = { sheet: 30, button: 20, chip: 999, moodCircle: 999, toast: 20 };

export const glass = {
  background: 'rgba(11,11,26,0.25)',
  borderColor: 'rgba(255,255,255,0.18)',
  highlight: 'rgba(255,255,255,0.20)',
  blurIntensity: 28,
  saturation: 1.6,
  shadow: { color: '#000', opacity: 0.25, radius: 50, offsetY: 20 },
};

export const ui = {
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.8)',
  textShadow: { color: 'rgba(0,0,0,0.33)', radius: 20, offsetY: 2 },
  primaryButton: { background: '#FFFFFF', text: '#14142A' },
  ghostButton: { borderColor: 'rgba(255,255,255,0.4)', text: '#FFFFFF' },
  chip: { background: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.15)' },
  moodCircle: { background: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.16)', selectedBackground: '#FFFFFF' },
  slider: { trackOff: 'rgba(255,255,255,0.2)', trackOn: '#FFFFFF', thumb: '#FFFFFF', thumbHalo: 'rgba(255,255,255,0.2)' },
  toast: { background: '#FFFFFF', text: '#14142A' },
  breathingBackground: '#05050C',
};

export const motion = {
  worldCrossfade: 1500,
  screenFade: 500,
  screenSlide: 700,
  moodHeadline: 600,
  moodSpring: 450,
  sceneZoom: 2000,
  cloudDrift: 60000,
  starTwinkle: 3000,
  sunBob: 9000,
  lightningEvery: 2600,
  lightningChance: 0.5,
  lightningFade: 350,
  buttonPress: 200,
  toastVisible: 3200,
  breathing: { inhale: 4000, hold: 2000, exhale: 4000, rounds: 5, minScale: 1, maxScale: 2.4 },
};

export const easing = {
  standard: [0.2, 0.9, 0.2, 1],
  spring:   [0.3, 1.8, 0.5, 1],
  zoom:     [0.2, 0.8, 0.2, 1],
};

export const particles = {
  rain:     { base: 150, speed: [10, 22], slant: -2, color: 'rgba(205,225,255,0.5)' },
  snow:     { base: 80,  speed: [0.4, 1.2], sway: 0.6, color: 'rgba(255,255,255,0.85)' },
  sparkles: { base: 45,  speed: [0.15, 0.45], glow: 10, color: '#FFFFFF' },
  fog:      { base: 7,   speed: [0.15, 0.45], radius: [130, 200], color: 'rgba(255,255,255,0.2)' },
  none:     { base: 0 },
  maxCount: 150,
};

const theme = { moods, moodOrder, worldFromMood, depthMix, timeOfDay, currentTimeOfDay, fonts, type, space, radius, glass, ui, motion, easing, particles };
export default theme;