// src/components/UI/Feedback.js
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import theme from '../../theme/moodWorldTheme';

export function Chip({ label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function Toast({ message, visible, onDismiss }) {
  const translateY = useSharedValue(-120);

  useEffect(() => {
    if (visible) {
      translateY.value = withSequence(
        // Slide down with slight overshoot
        withTiming(54, { 
          duration: 450, 
          easing: Easing.bezier(0.3, 1.4, 0.4, 1) 
        }),
        // Visible for 3.2s (spec: toastVisible: 3200ms)
        withTiming(54, { duration: theme.motion.toastVisible }),
        // Slide back up
        withTiming(-120, { duration: 350, easing: Easing.in(Easing.ease) }, () => {
          if (onDismiss) runOnJS(onDismiss)();
        })
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: theme.ui.chip.background,
    borderWidth: 1,
    borderColor: theme.ui.chip.border,
    borderRadius: theme.radius.chip,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: {
    ...theme.type.chip,
    color: theme.ui.text,
  },
  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.ui.toast.background,
    borderRadius: theme.radius.toast,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 999,
  },
  toastText: {
    ...theme.type.button,
    color: theme.ui.toast.text,
  },
});