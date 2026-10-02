// src/screens/CheckInScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Scene from '../components/World/Scene';
import GlassSheet from '../components/UI/GlassSheet';
import MoodPicker from '../components/UI/MoodPicker';
import IntensitySlider from '../components/UI/IntensitySlider';
import { PrimaryButton } from '../components/UI/Buttons';
import { useAuth } from '../context/AuthContext';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';
import { useWorld } from '../world/WorldContext';

export default function CheckInScreen({ navigation }) {
  const { user, recordCheckIn } = useAuth();
  const { updateWorld } = useWorld();
  const [selectedMood, setSelectedMood] = useState(user?.currentMood || 'Okay');
  const [intensity, setIntensity] = useState(5);
  const [triggers, setTriggers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const isCompact = screenHeight < 720;

  // Mood headline change: 600 ms, fade in with 14 px rise
  const headlineY = useSharedValue(0);
  const headlineOpacity = useSharedValue(1);

  useEffect(() => {
    updateWorld({
      emotion: selectedMood,
      intensity,
      timeOfDay: theme.currentTimeOfDay(),
    });

    headlineY.value = 14;
    headlineOpacity.value = 0.2;
    headlineY.value = withTiming(0, {
      duration: theme.motion.moodHeadline,
      easing: Easing.out(Easing.ease),
    });
    headlineOpacity.value = withTiming(1, {
      duration: theme.motion.moodHeadline,
      easing: Easing.out(Easing.ease),
    });
  }, [selectedMood, intensity, updateWorld]);

  const animatedHeadlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headlineY.value }],
    opacity: headlineOpacity.value,
  }));

  const moodConfig = theme.worldFromMood(selectedMood, intensity);
  const triggerOptions = ['Work', 'Sleep', 'Relationships', 'Health', 'Money', 'Family', 'Social Life', 'Other'];

  const handleBuildWorld = async () => {
    setSaving(true);
    setError('');
    const result = await recordCheckIn(selectedMood, intensity, triggers);
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'We could not save your check-in. Please try again.');
      return;
    }

    navigation.navigate('World', {
      emotion: selectedMood,
      intensity,
      triggers,
      worldState: moodConfig,
    });
  };

  // Tab bar height (64) + bottom offset (insets.bottom + 6) + breathing space
  const bottomTabBarClearance = Math.max(insets.bottom, 10) + 76;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + verticalScale(10), 56),
            paddingBottom: bottomTabBarClearance,
            paddingHorizontal: Math.min(moderateScale(22), screenWidth * 0.06),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header Information per Spec */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.subtitle}>Right now I feel</Text>
            <Animated.View style={animatedHeadlineStyle}>
              <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>
                {selectedMood}
              </Text>
            </Animated.View>
            <Text style={styles.description}>
              {moodConfig.weather} over the {moodConfig.env.toLowerCase()}
            </Text>
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>
              🔥 {user?.streak || 1} {(user?.streak || 1) === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>

        {/* Bottom Glass Sheet Controls */}
        <GlassSheet style={[styles.glassSheet, isCompact && styles.glassSheetCompact]}>
          {/* 7 Mood Circles with 450ms spring lift */}
          <MoodPicker
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
          />
          {/* Intensity Slider with halo thumb */}
          <IntensitySlider
            value={intensity}
            onChange={setIntensity}
          />
          <Text style={styles.triggerLabel}>What is shaping this feeling?</Text>
          <View style={styles.triggerGrid}>
            {triggerOptions.map((trigger) => {
              const selected = triggers.includes(trigger);
              return (
                <TouchableOpacity
                  key={trigger}
                  onPress={() => setTriggers((current) => (
                    selected ? current.filter((item) => item !== trigger) : [...current, trigger]
                  ))}
                  style={[styles.triggerChip, selected && styles.triggerChipSelected]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.triggerText, selected && styles.triggerTextSelected]}>{trigger}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {/* Primary Action Button */}
          <PrimaryButton
            label={saving ? 'Saving your moment...' : 'Build my world'}
            onPress={handleBuildWorld}
            disabled={saving}
            style={styles.buildButton}
          />
        </GlassSheet>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    ...theme.type.body,
    fontSize: scaledFontSize(13),
    color: theme.ui.textSoft,
    letterSpacing: 0.5,
  },
  heroTitle: {
    ...theme.type.hero,
    fontSize: scaledFontSize(46),
    color: theme.ui.text,
    lineHeight: scaledFontSize(52),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 2,
  },
  heroTitleCompact: {
    fontSize: scaledFontSize(36),
    lineHeight: scaledFontSize(42),
  },
  description: {
    ...theme.type.body,
    fontSize: scaledFontSize(13),
    color: theme.ui.textSoft,
    marginTop: 2,
  },
  streakPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: theme.radius.chip,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakText: {
    ...theme.type.chip,
    fontSize: scaledFontSize(12),
    color: theme.ui.text,
  },
  glassSheet: {
    gap: 6,
    marginTop: 12,
  },
  glassSheetCompact: {
    padding: 12,
    gap: 4,
  },
  buildButton: {
    marginTop: 8,
    width: '100%',
  },
  triggerLabel: {
    ...theme.type.label,
    color: theme.ui.textSoft,
    marginTop: 8,
    marginBottom: 2,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  triggerChip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: theme.ui.chip.border,
    backgroundColor: theme.ui.chip.background,
  },
  triggerChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  triggerText: {
    ...theme.type.chip,
    color: theme.ui.textSoft,
    fontSize: scaledFontSize(11),
  },
  triggerTextSelected: {
    color: '#14142A',
  },
  errorText: {
    ...theme.type.body,
    color: '#FCA5A5',
    fontSize: scaledFontSize(12),
    marginTop: 4,
  },
});