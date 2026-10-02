// src/theme/scaling.js
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base guideline metrics based on standard modern smartphone (iPhone 13/14 / Pixel standard: 390 x 844)
const GUIDELINE_BASE_WIDTH = 390;
const GUIDELINE_BASE_HEIGHT = 844;

/**
 * Scales a size horizontally based on device screen width
 */
export const scale = (size) => (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;

/**
 * Scales a size vertically based on device screen height
 */
export const verticalScale = (size) => (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;

/**
 * Moderate scaling with configurable factor (default 0.5)
 * Useful for fonts and paddings to prevent them from becoming too large or small
 */
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Clamped font scaler that respects accessibility but prevents layout breakage
 */
export const scaledFontSize = (size, min = size * 0.85, max = size * 1.25) => {
  const scaled = moderateScale(size, 0.4);
  return Math.min(Math.max(scaled, min), max);
};

export const DEVICE = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 700,
  isTallScreen: SCREEN_HEIGHT >= 850, // Pixel 7 (915dp), Modern Galaxies, etc.
  pixelRatio: PixelRatio.get(),
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
};

export default {
  scale,
  verticalScale,
  moderateScale,
  scaledFontSize,
  DEVICE,
};
