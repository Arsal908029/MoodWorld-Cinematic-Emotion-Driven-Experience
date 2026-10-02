// src/screens/PolicyInstructionScreen.js
import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { PrimaryButton } from '../components/UI/Buttons';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';

export default function PolicyInstructionScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + verticalScale(14), 48),
          paddingBottom: Math.max(insets.bottom + verticalScale(14), 32),
          paddingHorizontal: moderateScale(20),
        },
      ]}
    >
      <GlassSheet style={styles.sheet}>
        <Text style={styles.title}>Privacy Policy & Usage Rules</Text>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>1. Authenticated Data Privacy</Text>
          <Text style={styles.body}>
            Your mood check-ins, journal notes, and emotional trends are protected by authenticated session tokens on your device and private backend server.
          </Text>
          <Text style={styles.heading}>2. Guidelines & Instructions</Text>
          <Text style={styles.body}>
            • Log your emotions daily to keep your atmosphere synchronized.{"\n"}
            • Use the breathing visualizer during moments of high stress.{"\n"}
            • MoodWorld is a reflective mindfulness toolkit and does not replace medical advice.
          </Text>
        </ScrollView>
        <PrimaryButton label="I Understand" onPress={() => navigation.goBack()} />
      </GlassSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
  },
  sheet: {
    maxHeight: '85%',
    padding: 20,
    gap: 10,
  },
  title: {
    ...theme.type.heading,
    fontSize: scaledFontSize(22),
    color: '#FFF',
    marginBottom: 8,
  },
  scroll: {
    marginVertical: 10,
  },
  heading: {
    ...theme.type.button,
    fontSize: scaledFontSize(14),
    color: '#60A5FA',
    marginTop: 10,
  },
  body: {
    ...theme.type.body,
    fontSize: scaledFontSize(13),
    color: theme.ui.textSoft,
    marginTop: 4,
    lineHeight: 22,
  },
});