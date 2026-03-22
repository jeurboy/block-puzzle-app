import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  APP_ENV: extra.appEnv as string,
  API_URL: extra.apiUrl as string,
} as const;
