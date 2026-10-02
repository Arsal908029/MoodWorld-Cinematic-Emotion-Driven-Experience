// src/screens/WorldScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, useWindowDimensions, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Scene from '../components/World/Scene';
import GlassSheet from '../components/UI/GlassSheet';
import { Chip } from '../components/UI/Feedback';
import { PrimaryButton, GhostButton } from '../components/UI/Buttons';
import RecommendationCard from '../components/UI/RecommendationCard';
import MoodMusicCard from '../components/UI/MoodMusicCard';
import { useMusic } from '../context/MusicContext';
import { fetchCommunityAtmosphereApi } from '../services/api';
import { getRecommendation } from '../services/recommendations';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';

export default function WorldScreen({ route, navigation }) {
  const { emotion = 'Calm', intensity = 6 } = route.params || {};
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const isCompact = screenHeight < 720;

  const [communityCount, setCommunityCount] = useState(0);
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [musicHidden, setMusicHidden] = useState(false);
  const { song, loading: musicLoading, error: musicError, requestSong } = useMusic();

  // Scene arrival zoom from 1.18 to 1.0 over 2000ms (spec: sceneZoom 2000ms cubic-bezier(.2,.8,.2,1))
  const sceneScale = useSharedValue(1.18);
  const sceneOpacity = useSharedValue(0.85);

  useEffect(() => {
    sceneScale.value = withTiming(1.0, {
      duration: theme.motion.sceneZoom,
      easing: Easing.bezier(
        theme.easing.zoom[0],
        theme.easing.zoom[1],
        theme.easing.zoom[2],
        theme.easing.zoom[3]
      ),
    });
    sceneOpacity.value = withTiming(1.0, {
      duration: theme.motion.sceneZoom,
      easing: Easing.bezier(
        theme.easing.zoom[0],
        theme.easing.zoom[1],
        theme.easing.zoom[2],
        theme.easing.zoom[3]
      ),
    });
  }, []);

  useEffect(() => {
    requestSong({ emotion, intensity });
  }, [emotion, intensity, requestSong]);

  const animatedSceneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sceneScale.value }],
    opacity: sceneOpacity.value,
  }));

  useEffect(() => {
    async function loadCommunity() {
      const res = await fetchCommunityAtmosphereApi();
      if (res.success && res.total) {
        setCommunityCount(res.total);
      }
    }
    loadCommunity();
  }, []);

  const moodConfig = theme.worldFromMood(emotion, intensity);
  const recommendation = getRecommendation(emotion, intensity);
  const bottomTabBarClearance = Math.max(insets.bottom, 10) + 76;

  const shareMySky = async () => {
    const shareText = `My MoodWorld sky today: ${emotion} energy, ${moodConfig.weather} weather, intensity ${intensity}/10. I’m keeping my streak alive. #MoodWorld`;
    try {
      await Share.share({
        message: shareText,
        title: 'My MoodWorld sky',
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  // Title formatting in sentence case per design spec
  const titleText = `A ${moodConfig.weather.toLowerCase()} ${moodConfig.env.toLowerCase()}`;

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
        {/* Top Section: Small "Your MoodWorld" + Title "A rainy forest" */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Text style={styles.subtitle}>Your MoodWorld</Text>
            {communityCount > 0 && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{communityCount} in orbit</Text>
              </View>
            )}
          </View>
          <Text style={[styles.title, isCompact && styles.titleCompact]}>
            {titleText}
          </Text>
        </View>

        <View style={styles.peekCard}>
          <Text style={styles.peekLabel}>Current atmosphere</Text>
          <Text style={styles.peekText}>{emotion} · {moodConfig.weather} · {intensity}/10</Text>
        </View>

        {/* Bottom Glass Sheet */}
        <GlassSheet style={[styles.glassSheet, isCompact && styles.glassSheetCompact]}>
          <Text style={styles.sheetHeading}>Reflecting {emotion}</Text>
          <Text style={styles.sheetBody}>
            Your environment has shifted to mirror your emotional state and intensity.
          </Text>

          {/* Environmental Feature Chips per Spec: weather, environment, fog, rain %, music */}
          <View style={styles.chipRow}>
            <Chip label={`Weather: ${moodConfig.weather}`} />
            <Chip label={`Env: ${moodConfig.env}`} />
            <Chip label={`Fog: ${moodConfig.fog}`} />
            {moodConfig.rainIntensity > 0 && (
              <Chip label={`Rain: ${Math.round(moodConfig.rainIntensity * 100)}%`} />
            )}
            <Chip label={`Music: ${moodConfig.music}`} />
          </View>

          {/* Navigation Action Buttons per Spec: Primary & Ghost */}
          <View style={styles.buttonGroup}>
            <PrimaryButton
              label="Start breathing session"
              onPress={() => navigation.navigate('Breathing', { emotion, intensity })}
            />
            <GhostButton
              label="Update mood"
              onPress={() => navigation.navigate('CheckIn')}
            />
            <GhostButton
              label="Share my sky"
              onPress={shareMySky}
            />
          </View>
        </GlassSheet>

        {showRecommendation && (
          <RecommendationCard
            recommendation={recommendation}
            onDismiss={() => setShowRecommendation(false)}
            onStart={() => {
              if (recommendation.action === 'Start breathing') {
                navigation.navigate('Breathing', { emotion, intensity });
              } else {
                navigation.navigate('Journal', { emotion, intensity, triggers: route.params?.triggers || [] });
              }
            }}
          />
        )}

        {!musicHidden && (
          <MoodMusicCard
            song={song}
            loading={musicLoading}
            error={musicError}
            onNewSong={() => requestSong({ emotion, intensity })}
            onDismiss={() => setMusicHidden(true)}
          />
        )}
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
    marginTop: 4,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    ...theme.type.body,
    fontSize: scaledFontSize(13),
    color: theme.ui.textSoft,
    letterSpacing: 0.5,
  },
  peekCard: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 116, 144, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  peekLabel: {
    ...theme.type.body,
    fontSize: scaledFontSize(11),
    color: theme.ui.textSoft,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  peekText: {
    ...theme.type.body,
    fontSize: scaledFontSize(14),
    color: '#FFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#86EFAC',
    fontSize: scaledFontSize(11),
    fontWeight: '600',
  },
  title: {
    ...theme.type.title,
    fontSize: scaledFontSize(34),
    color: theme.ui.text,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginTop: 4,
  },
  titleCompact: {
    fontSize: scaledFontSize(26),
  },
  glassSheet: {
    gap: 6,
    marginTop: 12,
  },
  glassSheetCompact: {
    padding: 14,
    gap: 4,
  },
  sheetHeading: {
    ...theme.type.heading,
    fontSize: scaledFontSize(20),
    color: theme.ui.text,
  },
  sheetBody: {
    ...theme.type.body,
    fontSize: scaledFontSize(13),
    color: theme.ui.textSoft,
    marginVertical: 4,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  buttonGroup: {
    gap: 8,
    marginTop: 4,
  },
});