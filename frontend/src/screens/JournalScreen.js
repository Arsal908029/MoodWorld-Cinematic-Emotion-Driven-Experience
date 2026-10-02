import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { GhostButton, PrimaryButton } from '../components/UI/Buttons';
import { useAuth } from '../context/AuthContext';
import { createJournalApi } from '../services/api';
import theme from '../theme/moodWorldTheme';
import { scaledFontSize } from '../theme/scaling';

export default function JournalScreen({ route, navigation }) {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { emotion = 'Okay', intensity = 5, triggers = [] } = route.params || {};
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState(triggers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const tagOptions = ['Work', 'Sleep', 'Relationships', 'Health', 'Money', 'Family', 'Social Life', 'Other'];

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Write a few words before saving your reflection.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await createJournalApi(token, {
      text: text.trim(),
      emotion,
      tags: selectedTags,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'We could not save your reflection.');
      return;
    }
    setSaved(true);
  };

  if (saved) {
    return (
      <View style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + 24 }]}> 
          <Text style={styles.successMark}>✓</Text>
          <Text style={styles.title}>Reflection saved</Text>
          <Text style={styles.subtitle}>Your {emotion.toLowerCase()} moment is now part of your journey.</Text>
          <PrimaryButton label="See my progress" onPress={() => navigation.navigate('Insights')} style={styles.fullButton} />
          <GhostButton label="Return to my world" onPress={() => navigation.navigate('MainTabs', { screen: 'World' })} style={styles.fullButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.kicker}>A moment to keep</Text>
        <Text style={styles.title}>What is here for you?</Text>
        <Text style={styles.subtitle}>You were feeling {emotion.toLowerCase()} at {intensity}/10. There is no right way to write this.</Text>

        <GlassSheet style={styles.sheet}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="I noticed..."
            placeholderTextColor="rgba(255,255,255,0.45)"
            multiline
            textAlignVertical="top"
            style={styles.input}
            maxLength={1000}
          />
          <Text style={styles.counter}>{text.length}/1000</Text>
        </GlassSheet>

        <Text style={styles.label}>Keep the context</Text>
        <View style={styles.tagGrid}>
          {tagOptions.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedTags((current) => selected ? current.filter((item) => item !== tag) : [...current, tag])}
                style={[styles.tag, selected && styles.tagSelected]}
              >
                <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label={saving ? 'Saving reflection...' : 'Save reflection'} onPress={handleSave} disabled={saving} style={styles.fullButton} />
        <GhostButton label="Skip for now" onPress={() => navigation.navigate('Insights')} disabled={saving} style={styles.fullButton} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { paddingHorizontal: theme.space.screenX, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.space.screenX },
  backButton: { alignSelf: 'flex-start', paddingVertical: 6 },
  backText: { ...theme.type.body, color: theme.ui.textSoft, fontSize: scaledFontSize(14) },
  kicker: { ...theme.type.label, color: '#BAE6FD', textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...theme.type.title, color: theme.ui.text, fontSize: scaledFontSize(34), lineHeight: scaledFontSize(42) },
  subtitle: { ...theme.type.body, color: theme.ui.textSoft, lineHeight: 20 },
  sheet: { marginTop: 8 },
  input: { minHeight: 170, color: theme.ui.text, ...theme.type.body, fontSize: scaledFontSize(15), lineHeight: 23 },
  counter: { alignSelf: 'flex-end', color: theme.ui.textSoft, ...theme.type.label },
  label: { ...theme.type.label, color: theme.ui.textSoft, marginTop: 6 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: theme.radius.chip, backgroundColor: theme.ui.chip.background, borderWidth: 1, borderColor: theme.ui.chip.border },
  tagSelected: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  tagText: { ...theme.type.chip, color: theme.ui.textSoft, fontSize: scaledFontSize(11) },
  tagTextSelected: { color: '#14142A' },
  error: { ...theme.type.body, color: '#FCA5A5', fontSize: scaledFontSize(12) },
  fullButton: { width: '100%', marginTop: 4 },
  successMark: { color: '#86EFAC', fontSize: 54, marginBottom: 12 },
});
