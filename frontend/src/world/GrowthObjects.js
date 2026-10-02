import React from 'react';
import { StyleSheet, View } from 'react-native';

function getGrowthSpec(streak, emotion) {
  const safeEmotion = emotion || 'Okay';
  const tone = ['Happy', 'Calm', 'Okay'].includes(safeEmotion) ? 'light' : 'deep';

  const total = Math.min(6, Math.max(1, Math.ceil(streak / 2)));
  return Array.from({ length: total }, (_, index) => {
    const kind = streak >= 7 ? 'tree' : streak >= 3 ? 'flower' : 'grass';
    const depth = index % 3;

    return {
      key: `${kind}-${index}`,
      kind,
      left: 14 + index * 17 + (depth * 5),
      bottom: 28 + (index % 2) * 10,
      scale: 0.7 + (index % 3) * 0.2,
      color: tone === 'light' ? ['#9be7b8', '#fae3a9', '#b8ecff'][index % 3] : ['#4b7e58', '#d7a58a', '#8dc3b5'][index % 3],
    };
  });
}

export default function GrowthObjects({ streak = 0, emotion = 'Okay' }) {
  const items = getGrowthSpec(streak, emotion);

  if (!streak) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      {items.map((item) => (
        <View
          key={item.key}
          style={[
            styles.growth,
            item.kind === 'tree' && styles.tree,
            item.kind === 'flower' && styles.flower,
            item.kind === 'grass' && styles.grass,
            {
              left: `${item.left}%`,
              bottom: item.bottom,
              transform: [{ scale: item.scale }],
            },
          ]}
        >
          {item.kind === 'tree' && (
            <>
              <View style={[styles.trunk, { backgroundColor: '#4d2d1d' }]} />
              <View style={[styles.canopy, { backgroundColor: item.color }]} />
              <View style={[styles.canopySmall, { backgroundColor: '#d9f8c8' }]} />
            </>
          )}
          {item.kind === 'flower' && (
            <>
              <View style={[styles.stem, { backgroundColor: '#46a164' }]} />
              <View style={[styles.petal, { backgroundColor: item.color }]} />
              <View style={[styles.center, { backgroundColor: '#f7d777' }]} />
            </>
          )}
          {item.kind === 'grass' && (
            <>
              <View style={[styles.grassBlade, { backgroundColor: item.color }]} />
              <View style={[styles.grassBlade, { backgroundColor: '#96e6a6', marginLeft: 5 }]} />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  growth: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    opacity: 0.9,
  },
  tree: {
    width: 48,
    height: 78,
  },
  flower: {
    width: 36,
    height: 54,
  },
  grass: {
    width: 30,
    height: 42,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  trunk: {
    position: 'absolute',
    width: 5,
    height: 26,
    bottom: 0,
    borderRadius: 4,
  },
  canopy: {
    position: 'absolute',
    width: 30,
    height: 30,
    bottom: 20,
    borderRadius: 20,
    opacity: 0.9,
  },
  canopySmall: {
    position: 'absolute',
    width: 18,
    height: 18,
    bottom: 32,
    left: 14,
    borderRadius: 9,
    opacity: 0.85,
  },
  stem: {
    position: 'absolute',
    width: 3,
    height: 24,
    bottom: 0,
    borderRadius: 3,
  },
  petal: {
    position: 'absolute',
    width: 14,
    height: 14,
    bottom: 18,
    borderRadius: 100,
    opacity: 0.9,
  },
  center: {
    position: 'absolute',
    width: 8,
    height: 8,
    bottom: 14,
    borderRadius: 100,
  },
  grassBlade: {
    width: 4,
    height: 26,
    borderRadius: 4,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.8,
  },
});
