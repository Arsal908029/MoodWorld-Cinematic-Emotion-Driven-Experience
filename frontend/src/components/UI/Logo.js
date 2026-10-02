// src/components/UI/Logo.js
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function Logo({ size = 96, style }) {
  const floatY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Gentle floating motion
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Ethereal pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    auraOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: auraOpacity.value,
  }));

  const auraSize = size * 1.45;

  return (
    <View style={[styles.container, { width: auraSize, height: auraSize }, style]}>
      {/* Outer Luminous Atmospheric Glow */}
      <Animated.View
        style={[
          styles.aura,
          {
            width: auraSize,
            height: auraSize,
            borderRadius: auraSize / 2,
          },
          auraStyle,
        ]}
      />

      {/* Floating Center Orb */}
      <Animated.View style={[styles.orbWrapper, { width: size, height: size }, floatingStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            {/* Celestial Planet Gradient */}
            <RadialGradient id="planetGrad" cx="35%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="#93C5FD" stopOpacity="1" />
              <Stop offset="45%" stopColor="#3B82F6" stopOpacity="1" />
              <Stop offset="80%" stopColor="#1E3A8A" stopOpacity="1" />
              <Stop offset="100%" stopColor="#0F172A" stopOpacity="1" />
            </RadialGradient>

            {/* Shimmer Ring Gradient */}
            <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#67E8F9" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#C084FC" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#F472B6" stopOpacity="0.4" />
            </LinearGradient>

            {/* Star Glow */}
            <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Planetary Core */}
          <Circle cx="50" cy="50" r="44" fill="url(#planetGrad)" />

          {/* Atmospheric Inner Rim Highlight */}
          <Circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="1.8"
            opacity="0.85"
          />

          {/* Planetary Rings / Orbit */}
          <Path
            d="M 12 58 Q 50 82 88 58 Q 50 42 12 58 Z"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="2.4"
            opacity="0.75"
          />

          {/* Cosmic Crescent Moon & Star Glyph in Center */}
          <Path
            d="M 52 30 A 18 18 0 1 0 68 56 A 14 14 0 1 1 52 30 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* Guiding Sparkle Star */}
          <Path
            d="M 64 34 Q 66 38 70 40 Q 66 42 64 46 Q 62 42 58 40 Q 62 38 64 34 Z"
            fill="#FDE047"
          />
          <Circle cx="64" cy="40" r="1.5" fill="#FFFFFF" />

          {/* Small Ambient Sparkle */}
          <Circle cx="34" cy="46" r="1.2" fill="#FFFFFF" opacity="0.8" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
});
