import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, Image, ScrollView, Platform, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { GhostButton, PrimaryButton } from '../components/UI/Buttons';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { fetchMoodHistoryApi } from '../services/api';
import { musicLanguages, musicTypes } from '../services/musicQueries';
import { computeAchievements } from '../services/achievements';
import { configureDailyReminder } from '../services/dailyReminder';
import theme from '../theme/moodWorldTheme';

export default function ProfileScreen({ navigation }) {
  const { user, token, logoutUser, updateSettings, sendVerificationEmail, verifyEmail } = useAuth();
  const { history: musicHistory, language: musicLanguage, musicType, setLanguage, setMusicType } = useMusic();
  const insets = useSafeAreaInsets();

  const [autoWorld, setAutoWorld] = useState(user?.settings?.autoChangeWorld ?? true);
  const [soundEnabled, setSoundEnabled] = useState(user?.settings?.sound ?? true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    Platform.OS !== 'web' && (user?.settings?.notifications ?? true)
  );
  const [reminderTime, setReminderTime] = useState(user?.settings?.reminderTime ?? '20:00');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reminderStatus, setReminderStatus] = useState('');

  // Email verification modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const handleStartEmailVerification = async () => {
    setShowVerifyModal(true);
    setVerifyError('');
    setVerifyMessage('Sending verification code to your email...');
    try {
      const res = await sendVerificationEmail();
      if (res.success) {
        setVerifyMessage(res.message || 'Verification code sent!');
      } else {
        setVerifyError(res.error || 'Failed to send verification email.');
      }
    } catch (e) {
      setVerifyError('Network error sending code.');
    }
  };

  const handleConfirmVerification = async () => {
    if (!verifyCode || verifyCode.trim().length !== 6) {
      setVerifyError('Please enter the 6-digit verification code.');
      return;
    }
    setVerifySubmitting(true);
    setVerifyError('');
    try {
      const res = await verifyEmail(verifyCode.trim());
      if (res.success) {
        setVerifyMessage('✓ Email verified successfully!');
        setTimeout(() => {
          setShowVerifyModal(false);
          setVerifyCode('');
        }, 1500);
      } else {
        setVerifyError(res.error || 'Invalid or expired code.');
      }
    } catch (e) {
      setVerifyError('Network error verifying code.');
    } finally {
      setVerifySubmitting(false);
    }
  };

  useEffect(() => {
    async function loadHistory() {
      if (user?._id) {
        setLoadingHistory(true);
        const res = await fetchMoodHistoryApi(token, user._id);
        if (res.success && res.history) {
          setHistory(res.history);
        }
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [token, user?._id, user?.currentMood]);

  useEffect(() => {
    if (Platform.OS === 'web' || !notificationsEnabled) return undefined;

    let isMounted = true;
    configureDailyReminder(true, reminderTime, false).then(async (result) => {
      if (isMounted && !result.success) {
        setNotificationsEnabled(false);
        setReminderStatus(result.error);
        // In Expo Go reminders are unsupported: keep the saved preference.
        if (!result.unsupported) await updateSettings({ notifications: false });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const handleToggleAutoWorld = (val) => {
    setAutoWorld(val);
    updateSettings({ autoChangeWorld: val });
  };

  const handleToggleSound = (val) => {
    setSoundEnabled(val);
    updateSettings({ sound: val });
  };

  const handleToggleNotifications = async (val) => {
    const result = await configureDailyReminder(val, reminderTime);
    if (!result.success) {
      setNotificationsEnabled(false);
      setReminderStatus(result.error);
      await updateSettings({ notifications: false });
      return;
    }

    setNotificationsEnabled(val);
    setReminderStatus(val ? `Daily check-in reminder set for ${reminderTime}.` : 'Daily reminder is off.');
    await updateSettings({ notifications: val });
  };

  const handleReminderTime = async (value) => {
    setReminderTime(value);
    if (Platform.OS === 'web') {
      setReminderStatus(`Reminder time saved for ${value}.`);
      await updateSettings({ reminderTime: value });
      return;
    }

    const result = await configureDailyReminder(notificationsEnabled, value, false);
    if (notificationsEnabled && !result.success) {
      setNotificationsEnabled(false);
      setReminderStatus(result.error);
      await updateSettings({ notifications: false, reminderTime: value });
      return;
    }

    setReminderStatus(notificationsEnabled
      ? `Daily check-in reminder set for ${value}.`
      : `Reminder time saved for ${value}.`);
    await updateSettings({ reminderTime: value });
  };

  const handleMusicLanguage = (value) => {
    setLanguage(value);
    updateSettings({ musicLanguage: value });
  };

  const handleMusicType = (value) => {
    setMusicType(value);
    updateSettings({ musicType: value });
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const bottomTabBarClearance = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 12) + 84;
  const earnedAchievements = (user?.achievements?.length ? user.achievements : computeAchievements(user, history)).slice(0, 4);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 44),
            paddingBottom: bottomTabBarClearance,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageKicker}>ACCOUNT</Text>
          <Text style={styles.pageTitle}>Your profile</Text>
          <Text style={styles.pageSubtitle}>Your MoodWorld, your pace.</Text>
        </View>
        <GlassSheet style={styles.profileHeader}>
          <View style={styles.identityRow}>
            <Image
              source={{ uri: user?.avatar || 'https://i.imgur.com/6VBx3io.png' }}
              style={styles.avatar}
            />
            <View style={styles.identityCopy}>
              <Text style={styles.userName} numberOfLines={1}>{user?.name || 'Explorer'}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'Logged in user'}</Text>
              {user?.isEmailVerified ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified email</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.unverifiedBadge}
                  onPress={handleStartEmailVerification}
                  activeOpacity={0.8}
                >
                  <Text style={styles.unverifiedText}>Verify email</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>CURRENT STREAK</Text>
              <Text style={styles.statValue}>{user?.streak || 0}<Text style={styles.statUnit}> days</Text></Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>CURRENT MOOD</Text>
              <Text style={styles.statValue}>
                {theme.moods[user?.currentMood]?.emoji || '✨'} {user?.currentMood || 'Calm'}
              </Text>
            </View>
          </View>
        </GlassSheet>

        <GlassSheet style={styles.settingsSheet}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementGrid}>
            {earnedAchievements.map((achievement) => (
              <View key={achievement.id || achievement.title} style={styles.achievementTile}>
                <Text style={styles.achievementBadge}>{achievement.badge}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            ))}
          </View>
        </GlassSheet>

        {/* Real-Time Mood History Logs */}
        <GlassSheet style={styles.settingsSheet}>
          <Text style={styles.sectionTitle}>Recent Mood Journey</Text>
          {history.length > 0 ? (
            history.slice(0, 5).map((entry, idx) => {
              const moodInfo = theme.moods[entry.emotion] || theme.moods.Okay;
              const dateStr = entry.createdAt
                ? new Date(entry.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Today';

              return (
                <View key={entry._id || `h-${idx}`} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyEmoji}>{moodInfo.emoji}</Text>
                    <View>
                      <Text style={styles.historyEmotion}>{entry.emotion}</Text>
                      <Text style={styles.historySub}>
                        {moodInfo.weather} • {moodInfo.env}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyIntensity}>Lvl {entry.intensity}/10</Text>
                    <Text style={styles.historyDate}>{dateStr}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyHistory}>
              {loadingHistory ? 'Syncing mood journey...' : 'No check-ins yet today. Build your world!'}
            </Text>
          )}
        </GlassSheet>

        {/* Live Cloud Preferences */}
        <GlassSheet style={styles.settingsSheet}>
          <Text style={styles.sectionTitle}>Cloud Preferences</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Auto-Transform World</Text>
            <Switch
              value={autoWorld}
              onValueChange={handleToggleAutoWorld}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#60A5FA' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Ambient Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#60A5FA' }}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Daily reminder</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              disabled={Platform.OS === 'web'}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#60A5FA' }}
            />
          </View>

          <Text style={styles.reminderStatus}>
            {Platform.OS === 'web'
              ? 'Daily reminders are available in the mobile app.'
              : reminderStatus || 'A gentle daily check-in at the time you choose.'}
          </Text>

          <Text style={styles.preferenceLabel}>Reminder time</Text>
          <View style={styles.preferenceRow}>
            {['08:00', '14:00', '20:00', '21:30'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleReminderTime(option)}
                style={[styles.preferenceChip, reminderTime === option && styles.preferenceChipSelected]}
              >
                <Text style={[styles.preferenceText, reminderTime === option && styles.preferenceTextSelected]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.preferenceLabel}>Music language</Text>
          <View style={styles.preferenceRow}>
            {musicLanguages.map((option) => (
              <TouchableOpacity key={option.value} onPress={() => handleMusicLanguage(option.value)} style={[styles.preferenceChip, musicLanguage === option.value && styles.preferenceChipSelected]}>
                <Text style={[styles.preferenceText, musicLanguage === option.value && styles.preferenceTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.preferenceLabel}>Music type</Text>
          <View style={styles.preferenceRow}>
            {musicTypes.map((option) => (
              <TouchableOpacity key={option.value} onPress={() => handleMusicType(option.value)} style={[styles.preferenceChip, musicType === option.value && styles.preferenceChipSelected]}>
                <Text style={[styles.preferenceText, musicType === option.value && styles.preferenceTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassSheet>

        <GlassSheet style={styles.settingsSheet}>
          <Text style={styles.sectionTitle}>Recently Played Music</Text>
          {musicHistory.length ? musicHistory.slice(0, 3).map((item) => (
            <TouchableOpacity key={item.videoId} onPress={() => Linking.openURL(item.youtubeUrl || `https://www.youtube.com/watch?v=${item.videoId}`)} style={styles.musicHistoryRow}>
              <Text style={styles.musicHistoryTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.musicHistoryMeta}>{item.channelTitle}</Text>
            </TouchableOpacity>
          )) : <Text style={styles.emptyHistory}>Your mood soundtracks will appear here.</Text>}
        </GlassSheet>

        {/* Legal & Account Management */}
        <GlassSheet style={styles.settingsSheet}>
          <Text style={styles.sectionTitle}>Account & Legal</Text>

          <GhostButton
            label="View My Insights"
            onPress={() => navigation.navigate('Insights')}
            style={styles.actionBtn}
          />

          <GhostButton
            label="View Policy & Instructions"
            onPress={() => navigation.navigate('PolicyInstruction')}
            style={styles.actionBtn}
          />

          <GhostButton
            label="Log Out"
            onPress={handleLogout}
            style={[styles.actionBtn, styles.logoutBtn]}
          />
        </GlassSheet>
      </ScrollView>

      {/* Email Verification Modal */}
      {showVerifyModal && (
        <View style={styles.modalOverlay}>
          <GlassSheet style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <TouchableOpacity
                onPress={() => setShowVerifyModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              We sent a 6-digit verification code to {user?.email}. Enter it below to verify your account.
            </Text>

            {verifyMessage ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{verifyMessage}</Text>
              </View>
            ) : null}

            {verifyError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {verifyError}</Text>
              </View>
            ) : null}

            <TextInput
              placeholder="Enter 6-digit code"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={6}
              value={verifyCode}
              onChangeText={setVerifyCode}
            />

            <PrimaryButton
              label={verifySubmitting ? 'Verifying...' : 'Confirm Verification'}
              onPress={handleConfirmVerification}
              style={styles.verifySubmitBtn}
            />

            <TouchableOpacity
              onPress={handleStartEmailVerification}
              style={styles.resendBtn}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          </GlassSheet>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: theme.space.screenX,
    gap: 14,
  },
  pageHeader: {
    paddingHorizontal: 2,
    gap: 3,
    marginBottom: 2,
  },
  pageKicker: {
    ...theme.type.label,
    color: '#A7F3D0',
    fontSize: 11,
  },
  pageTitle: {
    ...theme.type.title,
    color: theme.ui.text,
    fontSize: 30,
    lineHeight: 38,
  },
  pageSubtitle: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    lineHeight: 19,
  },
  profileHeader: {
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(167, 243, 208, 0.65)',
  },
  userName: {
    ...theme.type.heading,
    fontSize: 22,
    color: '#FFF',
    maxWidth: '100%',
  },
  userEmail: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: 12,
    marginTop: 3,
    maxWidth: '100%',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.45)',
    borderRadius: theme.radius.chip,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  verifiedText: {
    ...theme.type.chip,
    color: '#4ADE80',
    fontSize: 11,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    borderRadius: theme.radius.chip,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  unverifiedText: {
    ...theme.type.chip,
    color: '#FDBA74',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  statValue: {
    ...theme.type.button,
    color: '#FFF',
    fontSize: 17,
  },
  statLabel: {
    ...theme.type.label,
    color: '#A7F3D0',
    fontSize: 9,
  },
  statUnit: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: 12,
  },
  divider: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  settingsSheet: {
    gap: 14,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementTile: {
    width: '48%',
    minHeight: 110,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  achievementBadge: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    ...theme.type.chip,
    color: '#FFF',
    marginBottom: 4,
  },
  achievementDescription: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: 11,
    lineHeight: 15,
  },
  sectionTitle: {
    ...theme.type.button,
    fontSize: 15,
    color: '#60A5FA',
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyEmoji: {
    fontSize: 22,
  },
  historyEmotion: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  historySub: {
    color: theme.ui.textSoft,
    fontSize: 12,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyIntensity: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
  },
  historyDate: {
    color: theme.ui.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  emptyHistory: {
    color: theme.ui.textSoft,
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingText: {
    ...theme.type.body,
    color: '#FFF',
  },
  reminderStatus: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -8,
  },
  actionBtn: {
    width: '100%',
    minHeight: 50,
  },
  logoutBtn: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    marginTop: 2,
  },
  preferenceLabel: {
    ...theme.type.label,
    color: theme.ui.textSoft,
    marginTop: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  preferenceChip: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: theme.radius.chip,
    backgroundColor: theme.ui.chip.background,
    borderWidth: 1,
    borderColor: theme.ui.chip.border,
  },
  preferenceChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  preferenceText: {
    ...theme.type.chip,
    color: theme.ui.textSoft,
    fontSize: 11,
  },
  preferenceTextSelected: {
    color: '#14142A',
  },
  musicHistoryRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  musicHistoryTitle: {
    ...theme.type.chip,
    color: theme.ui.text,
  },
  musicHistoryMeta: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...theme.type.heading,
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    color: theme.ui.textSoft,
    fontSize: 18,
  },
  modalSubtitle: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  codeInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.radius.button,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  verifySubmitBtn: {
    width: '100%',
    marginTop: 4,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  resendText: {
    ...theme.type.chip,
    color: '#60A5FA',
    fontSize: 13,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderRadius: 10,
    padding: 10,
  },
  infoText: {
    color: '#93C5FD',
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
});