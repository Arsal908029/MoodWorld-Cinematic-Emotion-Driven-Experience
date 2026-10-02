import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Scene from '../components/World/Scene';
import { useAuth } from '../context/AuthContext';
import theme from '../theme/moodWorldTheme';
import { useWorld } from './WorldContext';
import { useWorldPalette } from './useWorldPalette';

export default function WorldBackground() {
  const { emotion, intensity, timeOfDay, previousEmotion } = useWorld();
  const { user } = useAuth();
  const opacity = useSharedValue(0.88);

  const palette = useWorldPalette({
    fromEmotion: previousEmotion || emotion,
    toEmotion: emotion,
    intensity,
  });

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: theme.motion.worldCrossfade,
      easing: Easing.out(Easing.ease),
    });
  }, [emotion, intensity, timeOfDay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.world, animatedStyle]} pointerEvents="none">
      <Scene
        emotion={emotion}
        intensity={intensity}
        timeOfDayKey={timeOfDay}
        moodConfigOverride={palette}
        streak={user?.streak || 0}
        companionAvatar={user?.avatar}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  world: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020817',
  },
});
