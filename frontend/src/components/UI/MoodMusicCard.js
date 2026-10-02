import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassSheet from './GlassSheet';
import { GhostButton, PrimaryButton } from './Buttons';
import theme from '../../theme/moodWorldTheme';
import { scaledFontSize } from '../../theme/scaling';

export default function MoodMusicCard({ song, loading, error, onNewSong, onDismiss }) {
  if (!song && !loading && !error) return null;

  const openSong = async () => {
    if (song?.youtubeUrl && await Linking.canOpenURL(song.youtubeUrl)) {
      await Linking.openURL(song.youtubeUrl);
    }
  };

  return (
    <GlassSheet style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Your mood soundtrack</Text>
          <Text style={styles.title}>{loading ? 'Finding a fresh song...' : song?.title || 'Music is resting'}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} accessibilityLabel="Hide music">
          <Text style={styles.dismiss}>Hide</Text>
        </TouchableOpacity>
      </View>
      {song ? <Text style={styles.channel}>{song.channelTitle} • {song.language}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        {song ? <PrimaryButton label="Open on YouTube" onPress={openSong} style={styles.action} /> : null}
        <GhostButton label={loading ? 'Searching...' : 'New song'} onPress={onNewSong} disabled={loading} style={styles.action} />
      </View>
    </GlassSheet>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  kicker: { ...theme.type.label, color: '#BAE6FD', textTransform: 'uppercase', letterSpacing: 1, fontSize: scaledFontSize(10) },
  title: { ...theme.type.heading, color: theme.ui.text, fontSize: scaledFontSize(17), maxWidth: 260, marginTop: 4 },
  channel: { ...theme.type.body, color: theme.ui.textSoft, fontSize: scaledFontSize(11) },
  dismiss: { ...theme.type.body, color: theme.ui.textSoft, fontSize: scaledFontSize(11) },
  error: { ...theme.type.body, color: '#FCD34D', fontSize: scaledFontSize(12), lineHeight: 18 },
  actions: { gap: 8, marginTop: 4 },
  action: { width: '100%' },
});
