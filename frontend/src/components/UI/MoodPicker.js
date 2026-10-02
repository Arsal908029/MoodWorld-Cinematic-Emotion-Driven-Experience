// src/components/UI/MoodPicker.js
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import theme from '../../theme/moodWorldTheme';

function MoodItem({ moodKey, moodData, isSelected, onSelect }) {
  const liftY = useSharedValue(isSelected ? -5 : 0);
  const scale = useSharedValue(isSelected ? 1.18 : 1.0);

  useEffect(() => {
    if (isSelected) {
      liftY.value = withTiming(-5, {
        duration: theme.motion.moodSpring,
        easing: Easing.bezier(
          theme.easing.spring[0],
          theme.easing.spring[1],
          theme.easing.spring[2],
          theme.easing.spring[3]
        ),
      });
      scale.value = withTiming(1.18, {
        duration: theme.motion.moodSpring,
        easing: Easing.bezier(
          theme.easing.spring[0],
          theme.easing.spring[1],
          theme.easing.spring[2],
          theme.easing.spring[3]
        ),
      });
    } else {
      liftY.value = withTiming(0, { duration: 250, easing: Easing.ease });
      scale.value = withTiming(1.0, { duration: 250, easing: Easing.ease });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: liftY.value }, { scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(moodKey)}
      style={styles.moodItem}
    >
      <Animated.View
        style={[
          styles.circle,
          isSelected && styles.circleSelected,
          animatedStyle,
        ]}
      >
        <Text style={styles.emoji}>{moodData.emoji}</Text>
      </Animated.View>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {moodKey}
      </Text>
    </TouchableOpacity>
  );
}

export default function MoodPicker({ selectedMood, onSelectMood }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {theme.moodOrder.map((moodKey) => {
        const moodData = theme.moods[moodKey];
        const isSelected = selectedMood === moodKey;
        return (
          <MoodItem
            key={moodKey}
            moodKey={moodKey}
            moodData={moodData}
            isSelected={isSelected}
            onSelect={onSelectMood}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 46,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.moodCircle,
    backgroundColor: theme.ui.moodCircle.background,
    borderWidth: 1,
    borderColor: theme.ui.moodCircle.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleSelected: {
    backgroundColor: theme.ui.moodCircle.selectedBackground,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    ...theme.type.label,
    color: theme.ui.textSoft,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});