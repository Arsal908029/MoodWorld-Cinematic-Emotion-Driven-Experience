import { useMemo } from 'react';
import theme from '../theme/moodWorldTheme';

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') {
    return { r: 255, g: 255, b: 255 };
  }

  const cleaned = hex.replace('#', '');
  const normalized = cleaned.length === 3
    ? cleaned.split('').map((char) => char + char).join('')
    : cleaned;

  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (channel) => channel.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColors(fromColor, toColor, amount) {
  if (!fromColor) return toColor;
  if (!toColor) return fromColor;

  const from = hexToRgb(fromColor);
  const to = hexToRgb(toColor);

  const r = Math.round(from.r + (to.r - from.r) * amount);
  const g = Math.round(from.g + (to.g - from.g) * amount);
  const b = Math.round(from.b + (to.b - from.b) * amount);

  return rgbToHex({ r, g, b });
}

export function useWorldPalette({ fromEmotion, toEmotion, intensity }) {
  return useMemo(() => {
    const previousMood = theme.moods[fromEmotion] || theme.moods.Okay;
    const nextMood = theme.moods[toEmotion] || theme.moods.Okay;
    const transitionAmount = fromEmotion === toEmotion ? 1 : 0.72;

    const blendedSky = previousMood.sky.map((color, index) => (
      mixColors(color, nextMood.sky[index] || color, transitionAmount)
    ));

    const blendedStars = Math.max(previousMood.stars, nextMood.stars) * (1 - (1 - transitionAmount) * 0.35);
    const blendedClouds = Math.max(previousMood.clouds, nextMood.clouds) * 0.9;
    const blendedRainbow = Math.max(previousMood.rainbow, nextMood.rainbow) * 0.75;
    const blendedSunOffset = previousMood.sunOffset + (nextMood.sunOffset - previousMood.sunOffset) * transitionAmount;

    return {
      ...theme.worldFromMood(toEmotion, intensity),
      sky: blendedSky,
      sun: mixColors(previousMood.sun, nextMood.sun, transitionAmount),
      ground: mixColors(previousMood.ground, nextMood.ground, transitionAmount),
      clouds: blendedClouds,
      stars: blendedStars,
      rainbow: blendedRainbow,
      sunOffset: blendedSunOffset,
      particleScale: 0.35 + (intensity || 5) / 12,
      atmosphere: 0.35 + (intensity || 5) / 12,
    };
  }, [fromEmotion, toEmotion, intensity]);
}
