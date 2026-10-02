// src/screens/BreathingScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS 
} from 'react-native-reanimated';
import { Toast } from '../components/UI/Feedback';
import Particles from '../components/World/Particles';
import { playBreathingCue } from '../services/soundscapes';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';

export default function BreathingScreen({ route, navigation }) {
  const { emotion = 'Calm', intensity = 6 } = route.params || {};
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [phase, setPhase] = useState('Breathe in');
  const [round, setRound] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Orb scale: 1 to 2.4 per spec
  const orbScale = useSharedValue(theme.motion.breathing.minScale);
  // Outline ring follows a fraction later
  const ringScale = useSharedValue(theme.motion.breathing.minScale);

  const skyMid = theme.moods[emotion]?.sky[1] || theme.moods.Calm.sky[1];

  const handleHold = () => {
    setPhase('Hold');
    if (soundOn) playBreathingCue('Hold', emotion);
  };

  const handleExhale = () => {
    setPhase('Breathe out');
    if (soundOn) playBreathingCue('Breathe out', emotion);
  };

  const finishSession = () => {
    navigation.navigate('World', {
      emotion,
      intensity,
      fromBreathing: true,
    });
  };

  const handleCycleComplete = () => {
    setRound((prev) => {
      if (prev >= theme.motion.breathing.rounds) {
        setToastVisible(true);
        setTimeout(() => {
          finishSession();
        }, theme.motion.toastVisible);
        return prev;
      }
      return prev + 1;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const runBreathingCycle = () => {
      if (!isMounted) return;

      // 1. Inhale: 4000ms, scale from 1 to 2.4
      setPhase('Breathe in');
      if (soundOn) playBreathingCue('Breathe in', emotion);
      orbScale.value = withTiming(
        theme.motion.breathing.maxScale,
        { duration: theme.motion.breathing.inhale, easing: Easing.inOut(Easing.ease) },
        () => {
          if (!isMounted) return;
          // 2. Hold: 2000ms
          runOnJS(handleHold)();
          orbScale.value = withSequence(
            withTiming(theme.motion.breathing.maxScale, { duration: theme.motion.breathing.hold }),
            // 3. Exhale: 4000ms, scale 2.4 to 1
            withTiming(
              theme.motion.breathing.minScale,
              { duration: theme.motion.breathing.exhale, easing: Easing.inOut(Easing.ease) },
              () => {
                if (isMounted) {
                  runOnJS(handleCycleComplete)();
                }
              }
            )
          );
        }
      );

      // Follower outline ring: follows a fraction (160ms) later
      ringScale.value = withDelay(
        160,
        withTiming(
          theme.motion.breathing.maxScale * 1.08,
          { duration: theme.motion.breathing.inhale, easing: Easing.inOut(Easing.ease) },
          () => {
            if (!isMounted) return;
            ringScale.value = withSequence(
              withTiming(theme.motion.breathing.maxScale * 1.08, { duration: theme.motion.breathing.hold }),
              withTiming(
                theme.motion.breathing.minScale,
                { duration: theme.motion.breathing.exhale, easing: Easing.inOut(Easing.ease) }
              )
            );
          }
        )
      );

      // Trigger "Breathe out" text after inhale (4s) + hold (2s)
      setTimeout(() => {
        if (isMounted) runOnJS(handleExhale)();
      }, theme.motion.breathing.inhale + theme.motion.breathing.hold);
    };

    runBreathingCycle();
    // Total cycle duration: 4s + 2s + 4s = 10s
    const totalCycleTime = theme.motion.breathing.inhale + theme.motion.breathing.hold + theme.motion.breathing.exhale;
    const interval = setInterval(runBreathingCycle, totalCycleTime);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: 0.35 + (orbScale.value - 1) * 0.3,
  }));

  return (
    <View style={styles.container}>
      {/* Dark Radial Background tinted by sky mid color */}
      <Svg height={screenHeight} width={screenWidth} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bgGrad" cx="50%" cy="50%" r="65%">
            <Stop offset="0%" stopColor={skyMid} stopOpacity="0.28" />
            <Stop offset="60%" stopColor="#0a0a1a" stopOpacity="0.85" />
            <Stop offset="100%" stopColor={theme.ui.breathingBackground} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={screenWidth} height={screenHeight} fill="url(#bgGrad)" />
      </Svg>

      {/* Gentle Floating Sparkles */}
      <Particles particleType="sparkles" intensity={4} />

      {/* Achievement Toast */}
      <Toast
        message="✨ Breathing session complete. Peace restored."
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      <View
        style={[
          styles.contentWrapper,
          {
            paddingTop: Math.max(insets.top + verticalScale(20), 56),
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 44 : 28) + 24,
            paddingHorizontal: Math.min(moderateScale(24), screenWidth * 0.08),
          },
        ]}
      >
        {/* Top Text per Spec: "Breathe in", "Hold", "Breathe out", "Round N of 5" */}
        <View style={styles.textContainer}>
          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.roundText}>
            Round {round} of {theme.motion.breathing.rounds}
          </Text>
        </View>

        {/* Centered Glowing Orb (110 px) + Thin Outline Ring Follower */}
        <View style={styles.orbContainer}>
          {/* Outline Ring Following Orb */}
          <Animated.View style={[styles.outlineRing, animatedRingStyle]} />

          {/* Centered Glowing Orb (110px) */}
          <Animated.View style={[styles.orb, animatedOrbStyle]}>
            <View style={styles.innerGlow} />
          </Animated.View>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.soundToggle}
            onPress={() => setSoundOn((value) => !value)}
            activeOpacity={0.8}
          >
            <Text style={styles.soundToggleText}>{soundOn ? 'Sound: ON' : 'Sound: OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finishButton}
            onPress={finishSession}
            activeOpacity={0.8}
          >
            <Text style={styles.finishText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.breathingBackground,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: verticalScale(14),
  },
  phaseText: {
    ...theme.type.title,
    fontSize: scaledFontSize(38),
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  roundText: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    marginTop: 8,
    fontSize: scaledFontSize(14),
    letterSpacing: 0.5,
  },
  orbContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  outlineRing: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 32,
    shadowOpacity: 0.85,
    elevation: 10,
  },
  innerGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowRadius: 18,
    shadowOpacity: 1,
  },
  bottomActions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  soundToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  soundToggleText: {
    ...theme.type.button,
    color: '#FFFFFF',
    fontSize: scaledFontSize(13),
  },
  finishButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  finishText: {
    ...theme.type.button,
    color: '#FFFFFF',
    fontSize: scaledFontSize(14),
  },
});