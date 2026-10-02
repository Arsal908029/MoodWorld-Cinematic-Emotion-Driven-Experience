import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassSheet from './GlassSheet';
import theme from '../../theme/moodWorldTheme';
import { scaledFontSize } from '../../theme/scaling';

export default function RecommendationCard({ recommendation, onStart, onDismiss }) {
  return (
    <GlassSheet style={styles.card}>
      <View style={styles.eyebrowRow}>
        <Text style={styles.eyebrow}>A gentle next step</Text>
        <TouchableOpacity onPress={onDismiss} accessibilityLabel="Dismiss recommendation">
          <Text style={styles.dismiss}>Dismiss</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{recommendation.title}</Text>
      <Text style={styles.description}>{recommendation.description}</Text>
      <TouchableOpacity onPress={onStart} style={styles.action} activeOpacity={0.85}>
        <Text style={styles.actionText}>{recommendation.action}</Text>
      </TouchableOpacity>
    </GlassSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    gap: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    ...theme.type.label,
    color: '#BAE6FD',
    fontSize: scaledFontSize(10),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dismiss: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: scaledFontSize(11),
  },
  title: {
    ...theme.type.heading,
    color: theme.ui.text,
    fontSize: scaledFontSize(20),
  },
  description: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    lineHeight: 19,
  },
  action: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.button,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 2,
  },
  actionText: {
    ...theme.type.chip,
    color: theme.ui.text,
  },
});
