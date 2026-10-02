// src/components/World/Particles.js
import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// 1. Raindrop Particle
function RainParticle({ index, screenWidth, screenHeight, speedMultiplier }) {
  const startX = (index * 29) % screenWidth;
  const startDelay = ((index * 137) % 1500);
  const duration = Math.max(900, (1800 / speedMultiplier) - (index % 400));

  const translateY = useSharedValue(-30);

  useEffect(() => {
    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(screenHeight + 30, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [screenHeight, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.rainDrop,
        {
          left: startX,
          opacity: 0.35 + ((index % 5) * 0.12),
          height: 14 + (index % 12),
        },
        animatedStyle,
      ]}
    />
  );
}

// 2. Snowflake Particle
function SnowParticle({ index, screenWidth, screenHeight }) {
  const startX = (index * 41) % screenWidth;
  const startDelay = ((index * 180) % 2500);
  const duration = 4000 + ((index * 350) % 3000);
  const swayDistance = 15 + (index % 20);

  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(screenHeight + 20, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      translateX.value = withRepeat(
        withSequence(
          withTiming(swayDistance, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(-swayDistance, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [screenHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  const size = 3 + (index % 5);

  return (
    <Animated.View
      style={[
        styles.snowFlake,
        {
          left: startX,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: 0.5 + ((index % 5) * 0.1),
        },
        animatedStyle,
      ]}
    />
  );
}

// 3. Sparkle Particle
function SparkleParticle({ index, screenWidth, screenHeight }) {
  const posX = (index * 67 + 20) % (screenWidth - 40);
  const posY = (index * 97 + 60) % (screenHeight * 0.65);
  const duration = 1800 + ((index * 400) % 1800);

  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    const delay = (index * 250) % 2000;
    const timeout = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.15, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const size = 4 + (index % 4);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          left: posX,
          top: posY,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

// 4. Fog Cloud Particle
function FogParticle({ index, screenWidth, screenHeight }) {
  const posY = screenHeight * 0.45 + ((index * 45) % (screenHeight * 0.35));
  const duration = 16000 + (index * 4000);

  const translateX = useSharedValue(-screenWidth * 0.4);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(screenWidth * 1.2, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [screenWidth, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.fogCloud,
        {
          top: posY,
          width: screenWidth * 0.8,
          height: 90,
          opacity: 0.12 + (index * 0.05),
        },
        animatedStyle,
      ]}
    />
  );
}

export default function Particles({ particleType, intensity = 5 }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  if (!particleType || particleType === 'none') return null;

  const speedMultiplier = 0.8 + (intensity / 10);
  const count = particleType === 'rain' ? 36 : particleType === 'snow' ? 28 : particleType === 'sparkles' ? 22 : 4;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => {
        if (particleType === 'rain') {
          return (
            <RainParticle
              key={`rain-${i}`}
              index={i}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
              speedMultiplier={speedMultiplier}
            />
          );
        }
        if (particleType === 'snow') {
          return (
            <SnowParticle
              key={`snow-${i}`}
              index={i}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
            />
          );
        }
        if (particleType === 'sparkles') {
          return (
            <SparkleParticle
              key={`sparkle-${i}`}
              index={i}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
            />
          );
        }
        if (particleType === 'fog') {
          return (
            <FogParticle
              key={`fog-${i}`}
              index={i}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
            />
          );
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rainDrop: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#BAE6FD',
    borderRadius: 1,
    transform: [{ rotate: '-8deg' }],
  },
  snowFlake: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: '#FDE047',
    shadowColor: '#FEF08A',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.9,
    elevation: 4,
  },
  fogCloud: {
    position: 'absolute',
    backgroundColor: 'rgba(226, 232, 240, 0.25)',
    borderRadius: 60,
  },
});