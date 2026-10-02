import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { useAuth } from '../context/AuthContext';
import { fetchJournalsApi, fetchMoodHistoryApi } from '../services/api';
import theme from '../theme/moodWorldTheme';
import { scaledFontSize } from '../theme/scaling';

function getSummary(history) {
  if (!history.length) {
    return {
      average: 0,
      commonMood: 'No data',
      streak: 0,
      triggers: [],
      weatherReport: 'A few more check-ins will reveal your pattern.',
    };
  }

  const moodCounts = {};
  const triggerCounts = {};
  history.forEach((entry) => {
    moodCounts[entry.emotion] = (moodCounts[entry.emotion] || 0) + 1;
    (entry.triggers || []).forEach((trigger) => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
  });

  const commonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
  const triggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);
  const average = (history.reduce((sum, entry) => sum + entry.intensity, 0) / history.length).toFixed(1);
  const recentMood = history[0]?.emotion || commonMood;
  const dominantWeather = theme.moods[commonMood]?.weather || 'Cloudy';
  const weatherReport = `Your recent weather is mostly ${dominantWeather.toLowerCase()} with a ${recentMood.toLowerCase()} high point. ${triggers.length ? `Work, routines, and ${triggers[0].toLowerCase()} keep repeating in your pattern.` : 'Your pattern is still balancing out.'}`;

  return {
    average,
    commonMood,
    streak: Math.max(history.length, 0),
    triggers,
    weatherReport,
  };
}

export default function InsightsScreen() {
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [journals, setJournals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!token || !user?._id) return;
    setRefreshing(true);
    const [moodResult, journalResult] = await Promise.all([
      fetchMoodHistoryApi(token, user._id),
      fetchJournalsApi(token),
    ]);
    if (moodResult.success) setHistory(moodResult.history || []);
    if (journalResult.success) setJournals(journalResult.entries || []);
    setRefreshing(false);
  }, [token, user?._id]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const summary = getSummary(history);
  const recent = history.slice(0, 7).reverse();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#FFFFFF" />}
      >
        <Text style={styles.kicker}>Your inner weather</Text>
        <Text style={styles.title}>Sky report</Text>
        <Text style={styles.subtitle}>Small check-ins become patterns when you give them time.</Text>

        {!history.length ? (
          <GlassSheet style={styles.emptySheet}>
            <Text style={styles.emptyTitle}>Your pattern is still forming</Text>
            <Text style={styles.emptyText}>Complete a few check-ins and reflections to see your emotional landscape here.</Text>
          </GlassSheet>
        ) : (
          <>
            <GlassSheet style={styles.heroSheet}>
              <Text style={styles.heroLabel}>Weather report</Text>
              <Text style={styles.weatherReport}>{summary.weatherReport}</Text>
            </GlassSheet>

            <View style={styles.statGrid}>
              <GlassSheet style={styles.stat}><Text style={styles.statValue}>{summary.average}</Text><Text style={styles.statLabel}>Average intensity</Text></GlassSheet>
              <GlassSheet style={styles.stat}><Text style={styles.statValue}>{summary.commonMood}</Text><Text style={styles.statLabel}>Most frequent mood</Text></GlassSheet>
              <GlassSheet style={styles.stat}><Text style={styles.statValue}>{user?.streak || summary.streak}</Text><Text style={styles.statLabel}>Day streak</Text></GlassSheet>
            </View>

            <GlassSheet style={styles.section}>
              <Text style={styles.sectionTitle}>Recent sky tiles</Text>
              <View style={styles.skyGrid}>
                {recent.map((entry, index) => {
                  const mood = theme.moods[entry.emotion] || theme.moods.Okay;
                  return (
                    <View key={entry._id || index} style={styles.skyTile}>
                      <Text style={styles.skyEmoji}>{mood.emoji}</Text>
                      <Text style={styles.skyMood}>{entry.emotion}</Text>
                      <Text style={styles.skyMeta}>{mood.weather}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassSheet>

            <GlassSheet style={styles.section}>
              <Text style={styles.sectionTitle}>Mood river</Text>
              <View style={styles.river}>
                {recent.map((entry, index) => {
                  const mood = theme.moods[entry.emotion] || theme.moods.Okay;
                  return (
                    <View key={`${entry._id || index}-river`} style={styles.barGroup}>
                      <View style={[styles.bar, { height: Math.max(26, entry.intensity * 12), backgroundColor: mood.sun || '#FFFFFF' }]} />
                      <Text style={styles.barLabel}>{mood.emoji}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassSheet>

            <GlassSheet style={styles.section}>
              <Text style={styles.sectionTitle}>What keeps showing up</Text>
              <View style={styles.triggerList}>
                {summary.triggers.length ? summary.triggers.map((trigger, index) => (
                  <Text key={`${trigger}-${index}`} style={styles.triggerChip}>{trigger}</Text>
                )) : <Text style={styles.emptyText}>No trigger pattern yet — keep logging and your signal will appear here.</Text>}
              </View>
            </GlassSheet>
          </>
        )}

        <GlassSheet style={styles.section}>
          <Text style={styles.sectionTitle}>Recent reflections</Text>
          {journals.length ? journals.slice(0, 3).map((entry) => (
            <View key={entry._id} style={styles.journalRow}>
              <Text style={styles.journalMood}>{theme.moods[entry.emotion]?.emoji || '◦'}</Text>
              <View style={styles.journalCopy}><Text style={styles.journalText} numberOfLines={2}>{entry.text}</Text><Text style={styles.timelineMeta}>{new Date(entry.createdAt).toLocaleDateString()}</Text></View>
            </View>
          )) : <Text style={styles.emptyText}>Your saved reflections will appear here.</Text>}
        </GlassSheet>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { paddingHorizontal: theme.space.screenX, gap: 14 },
  kicker: { ...theme.type.label, color: '#BAE6FD', textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...theme.type.title, color: theme.ui.text, fontSize: scaledFontSize(36) },
  subtitle: { ...theme.type.body, color: theme.ui.textSoft, lineHeight: 20 },
  heroSheet: { padding: 18, gap: 8 },
  heroLabel: { ...theme.type.label, color: '#BAE6FD', textTransform: 'uppercase', letterSpacing: 1 },
  weatherReport: { ...theme.type.body, color: theme.ui.text, lineHeight: 22 },
  statGrid: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, minHeight: 102, paddingHorizontal: 10, paddingVertical: 14 },
  statValue: { ...theme.type.heading, color: theme.ui.text, fontSize: scaledFontSize(19) },
  statLabel: { ...theme.type.label, color: theme.ui.textSoft, marginTop: 6, lineHeight: 14 },
  section: { gap: 10 },
  sectionTitle: { ...theme.type.heading, color: theme.ui.text, fontSize: scaledFontSize(20) },
  skyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skyTile: {
    width: '30%',
    minHeight: 92,
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skyEmoji: { fontSize: 22, marginBottom: 2 },
  skyMood: { ...theme.type.chip, color: theme.ui.text },
  skyMeta: { ...theme.type.body, color: theme.ui.textSoft, fontSize: 10 },
  river: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 110, gap: 8 },
  barGroup: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minHeight: 100 },
  bar: {
    width: '100%',
    maxWidth: 22,
    minHeight: 26,
    borderRadius: 10,
    opacity: 0.9,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  barLabel: { marginTop: 8, fontSize: 16 },
  triggerList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  triggerChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(186,230,253,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(186,230,253,0.25)',
    color: '#BAE6FD',
    overflow: 'hidden',
    fontFamily: theme.fonts?.sans || 'Sora',
    fontSize: 12,
    fontWeight: '600',
  },
  journalRow: { flexDirection: 'row', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  journalMood: { fontSize: 24 },
  journalCopy: { flex: 1 },
  journalText: { ...theme.type.body, color: theme.ui.text, lineHeight: 19 },
  emptySheet: { gap: 8 },
  emptyTitle: { ...theme.type.heading, color: theme.ui.text, fontSize: scaledFontSize(20) },
  emptyText: { ...theme.type.body, color: theme.ui.textSoft, lineHeight: 20 },
  timelineMeta: { ...theme.type.body, color: theme.ui.textSoft, fontSize: scaledFontSize(11), marginTop: 2 },
});
