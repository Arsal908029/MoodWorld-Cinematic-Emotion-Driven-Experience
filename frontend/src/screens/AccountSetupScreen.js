// src/screens/AccountSetupScreen.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { PrimaryButton } from '../components/UI/Buttons';
import Scene from '../components/World/Scene';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';

export default function AccountSetupScreen({ navigation }) {
  const [goal, setGoal] = useState('Mindfulness');
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const goals = ['Mindfulness', 'Stress Reduction', 'Emotional Tracking', 'Better Sleep'];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + verticalScale(20), 48),
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 32 : 20) + 36,
            paddingHorizontal: Math.min(moderateScale(22), screenWidth * 0.07),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Account Setup</Text>
          <Text style={styles.subtitle}>What is your primary focus for MoodWorld?</Text>
        </View>

        <GlassSheet style={styles.sheet}>
          {goals.map((item) => {
            const isSelected = goal === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                style={[styles.goalOption, isSelected && styles.selectedGoal]}
                onPress={() => setGoal(item)}
              >
                <Text style={[styles.goalText, isSelected && styles.selectedGoalText]}>
                  {item}
                </Text>
                {isSelected && <Text style={styles.checkMark}>✦</Text>}
              </TouchableOpacity>
            );
          })}

          <PrimaryButton
            label="Complete Setup"
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.completeBtn}
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: verticalScale(20),
  },
  title: {
    ...theme.type.hero,
    fontSize: scaledFontSize(36),
    color: '#FFF',
  },
  subtitle: {
    ...theme.type.body,
    fontSize: scaledFontSize(14),
    color: theme.ui.textSoft,
    marginTop: 6,
  },
  sheet: {
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: theme.radius.button,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  selectedGoal: {
    backgroundColor: 'rgba(96,165,250,0.25)',
    borderColor: '#60A5FA',
  },
  goalText: {
    ...theme.type.button,
    fontSize: scaledFontSize(15),
    color: 'rgba(255,255,255,0.85)',
  },
  selectedGoalText: {
    color: '#FFF',
    fontWeight: '700',
  },
  checkMark: {
    color: '#60A5FA',
    fontSize: 16,
  },
  completeBtn: {
    marginTop: 8,
    width: '100%',
  },
});