import { Platform } from 'react-native';

const REMINDER_ID = 'moodworld-daily-check-in';
const ANDROID_CHANNEL_ID = 'moodworld-reminders';
const EXPO_GO_MESSAGE =
  'Daily reminders need a development build. They are not available in Expo Go.';

// expo-notifications throws as soon as it is imported inside Expo Go (SDK 53+).
// So it is loaded lazily, only when a reminder is actually configured, and only
// outside Expo Go. This keeps the whole app from crashing on start-up.
let Notifications = null;
let handlerSet = false;

function isExpoGo() {
  try {
    const Constants = require('expo-constants').default;
    return (
      Constants?.executionEnvironment === 'storeClient' ||
      Constants?.appOwnership === 'expo'
    );
  } catch (_) {
    return false;
  }
}

function loadNotifications() {
  if (Notifications) return Notifications;
  if (isExpoGo()) return null;
  try {
    Notifications = require('expo-notifications');
  } catch (_) {
    return null;
  }
  if (!handlerSet) {
    handlerSet = true;
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (_) {}
  }
  return Notifications;
}

export async function configureDailyReminder(enabled, reminderTime, requestPermission = true) {
  if (Platform.OS === 'web') {
    return { success: false, error: 'Daily reminders are available in the mobile app.' };
  }

  const Notifications = loadNotifications();
  if (!Notifications) {
    return { success: false, unsupported: true, error: EXPO_GO_MESSAGE };
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);

    if (!enabled) {
      return { success: true };
    }

    const [hour, minute] = reminderTime.split(':').map(Number);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      return { success: false, error: 'Choose a valid reminder time.' };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Daily reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    let permissions = await Notifications.getPermissionsAsync();
    const alreadyAllowed = permissions.granted ||
      permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!alreadyAllowed && requestPermission) {
      permissions = await Notifications.requestPermissionsAsync();
    }

    const isAllowed = permissions.granted ||
      permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!isAllowed) {
      return { success: false, error: 'Allow notifications to set a daily reminder.' };
    }

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: 'A moment for yourself',
        body: 'Take a breath and check in with how you feel today.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Could not update your daily reminder. Please try again.' };
  }
}