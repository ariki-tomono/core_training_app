import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerNotification() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminder', {
      name: 'トレーニングリマインダー',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function scheduleDailyReminder(hour = 20, minute = 0) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 トレーニングの時間です！',
      body: '今日のトレーニングはもう終わりましたか？',
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
    },
  });
}
