// src/components/UI/GlassSheet.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import theme from '../../theme/moodWorldTheme';

export default function GlassSheet({ children, style }) {
  return (
    <View style={[styles.outerContainer, style]}>
      <BlurView
        intensity={theme.glass.blurIntensity}
        tint="dark"
        style={styles.blurView}
      >
        <View style={styles.highlightBorder} />
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: theme.radius.sheet,
    overflow: 'hidden',
    backgroundColor: theme.glass.background,
    borderWidth: 1,
    borderColor: theme.glass.borderColor,
    shadowColor: theme.glass.shadow.color,
    shadowOffset: { width: 0, height: theme.glass.shadow.offsetY },
    shadowOpacity: theme.glass.shadow.opacity,
    shadowRadius: theme.glass.shadow.radius,
    elevation: 8,
  },
  blurView: {
    padding: theme.space.sheetPad,
  },
  highlightBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.glass.highlight,
  },
});