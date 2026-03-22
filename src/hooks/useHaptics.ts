import * as Haptics from 'expo-haptics';

export function hapticPlace() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticLineClear() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticGameOver() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
