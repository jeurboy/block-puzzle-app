import Constants from "expo-constants";
import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const extra = Constants.expoConfig?.extra ?? {};

/**
 * Returns the correct AdMob Banner Unit ID:
 * - __DEV__ (dev client / local) → always TestIds.BANNER
 * - Production build → real ID from .env.production (falls back to TestIds if empty)
 */
function getAdMobBannerId(): string {
  if (__DEV__) return TestIds.BANNER;

  const realId =
    Platform.OS === "android"
      ? (extra.admobBannerAndroid as string)
      : (extra.admobBannerIos as string);

  return realId || TestIds.BANNER;
}

export const ENV = {
  APP_ENV: extra.appEnv as string,
  API_URL: extra.apiUrl as string,
  ADMOB_BANNER_ID: getAdMobBannerId(),
} as const;
