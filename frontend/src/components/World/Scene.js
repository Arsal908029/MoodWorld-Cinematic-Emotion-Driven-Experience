// src/components/World/Scene.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import Sky from './Sky';
import Foreground from './Foreground';
import Particles from './Particles';
import GrowthObjects from '../../world/GrowthObjects';
import CompanionOrb from '../../world/CompanionOrb';
import theme from '../../theme/moodWorldTheme';

export default function Scene({
  emotion = 'Okay',
  intensity = 5,
  timeOfDayKey = 'day',
  moodConfigOverride,
  streak = 0,
  companionAvatar,
}) {
  const moodConfig = moodConfigOverride || theme.worldFromMood(emotion, intensity);
  const [lightning, setLightning] = useState(false);

  // Lightning Trigger for Angry Mood (Stormy Weather)
  useEffect(() => {
    if (!moodConfig.lightning) return;

    const interval = setInterval(() => {
      if (Math.random() < theme.motion.lightningChance) {
        setLightning(true);
        setTimeout(() => setLightning(false), theme.motion.lightningFade);
      }
    }, theme.motion.lightningEvery);

    return () => clearInterval(interval);
  }, [moodConfig.lightning]);

  return (
    <View style={styles.container}>
      {/* 1. Dynamic Sky & Stars Layer */}
      <Sky moodConfig={moodConfig} timeOfDayKey={timeOfDayKey} />

      {/* 2. Environment Foreground Silhouettes */}
      <Foreground
        env={moodConfig.env}
        groundColor={moodConfig.ground}
        skyHorizonColor={moodConfig.sky[2]}
        timeOfDayKey={timeOfDayKey}
      />

      {/* 3. Streak-driven growth objects */}
      <GrowthObjects streak={streak} emotion={emotion} />

      {/* 4. Companion */}
      <CompanionOrb avatar={companionAvatar} emotion={emotion} streak={streak} visible={streak > 0 || !!companionAvatar} />

      {/* 5. Weather Particle Overlay */}
      <Particles particleType={moodConfig.particles} intensity={intensity} />

      {/* Lightning Flash Overlay */}
      {lightning && <View style={styles.lightningFlash} pointerEvents="none" />}

      {/* Vignette Shadow Frame */}
      <View style={styles.vignette} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  lightningFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: 'transparent',
  },
});