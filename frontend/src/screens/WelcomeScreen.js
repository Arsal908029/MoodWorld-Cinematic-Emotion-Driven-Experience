// src/screens/WelcomeScreen.js
import React from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { PrimaryButton, GhostButton } from '../components/UI/Buttons';
import Logo from '../components/UI/Logo';
import Scene from '../components/World/Scene';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const isCompact = screenHeight < 720;

  // On Android, ensure at least 50dp bottom clearance to clear system gesture navigation bar
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 32 : 20) + 36;
  const topInset = Math.max(insets.top + verticalScale(10), 48);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topInset,
            paddingBottom: bottomInset,
            paddingHorizontal: Math.min(moderateScale(22), screenWidth * 0.07),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Animated Brand Header */}
        <View style={[styles.heroSection, isCompact && styles.heroSectionCompact]}>
          <Logo size={isCompact ? 70 : moderateScale(88)} style={styles.logo} />
          <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact]}>
            MoodWorld
          </Text>
          <Text style={styles.brandSubtitle}>
            Your feelings shape your universe.
          </Text>
        </View>

        {/* Action Glass Sheet with spacious button layout */}
        <GlassSheet style={styles.actionSheet}>
          <Text style={styles.welcomeText}>
            Step inside your emotional atmosphere and transform your day.
          </Text>
          <View style={styles.buttonGroup}>
            <PrimaryButton
              label="Get Started"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.primaryButton}
            />
            <GhostButton
              label="I already have an account"
              onPress={() => navigation.navigate('Login')}
              style={styles.ghostButton}
            />
          </View>
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
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(16),
  },
  heroSectionCompact: {
    marginTop: 8,
    marginBottom: 8,
  },
  logo: {
    marginBottom: 12,
  },
  brandTitle: {
    ...theme.type.hero,
    fontSize: scaledFontSize(44),
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(56, 189, 248, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 18,
  },
  brandTitleCompact: {
    fontSize: scaledFontSize(36),
  },
  brandSubtitle: {
    ...theme.type.body,
    fontSize: scaledFontSize(15),
    color: theme.ui.textSoft,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  actionSheet: {
    padding: 20,
    marginTop: 16,
  },
  welcomeText: {
    ...theme.type.body,
    fontSize: scaledFontSize(14),
    color: theme.ui.textSoft,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
  },
  ghostButton: {
    width: '100%',
    paddingVertical: 16,
  },
});