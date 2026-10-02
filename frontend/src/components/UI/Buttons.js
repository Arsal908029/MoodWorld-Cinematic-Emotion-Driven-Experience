// src/components/UI/Buttons.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../../theme/moodWorldTheme';

export function PrimaryButton({ label, onPress, style, disabled = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.disabled, style]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ label, onPress, style, disabled = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.ghost, disabled && styles.disabled, style]}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: theme.ui.primaryButton.background,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    ...theme.type.button,
    color: theme.ui.primaryButton.text,
  },
  disabled: {
    opacity: 0.55,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.ui.ghostButton.borderColor,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    ...theme.type.button,
    color: theme.ui.ghostButton.text,
  },
});