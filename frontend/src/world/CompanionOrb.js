import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import theme from '../theme/moodWorldTheme';

const emotionFaces = {
  Happy: '😊',
  Calm: '😌',
  Okay: '🙂',
  Sad: '😢',
  Angry: '😠',
  Anxious: '😬',
  Tired: '😴',
};

export default function CompanionOrb({ avatar, emotion = 'Calm', streak = 0, visible = true }) {
  if (!visible) return null;

  const face = emotionFaces[emotion] || '✨';
  const scale = 0.9 + Math.min(0.8, (streak || 0) / 12);

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.orb, { transform: [{ scale }] }]}>
        <Image
          source={{ uri: avatar || 'https://i.imgur.com/6VBx3io.png' }}
          style={styles.avatar}
        />
        <View style={styles.faceBubble}>
          <Text style={styles.face}>{face}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 22,
    bottom: 120,
    zIndex: 20,
  },
  orb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  faceBubble: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 18, 35, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  face: {
    fontSize: 14,
  },
});
