import dotenv from "dotenv";
import path from "path";
import { ExpoConfig, ConfigContext } from "expo/config";

const APP_ENV = process.env.APP_ENV ?? "development";
const envFile = APP_ENV === "production" ? ".env.production" : ".env";

dotenv.config({ path: path.resolve(__dirname, envFile) });

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Block Bomb",
  slug: "block-puzzle-app",
  version: "1.1.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "blockbomb",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.jeurboy.blockpuzzle",
  },
  android: {
    package: "com.jeurboy.blockpuzzle",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-asset",
    "expo-audio",
    "expo-font",
    "expo-image",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/block-bomb.png",
        imageWidth: 300,
        resizeMode: "contain",
        backgroundColor: "#0a1538",
        dark: {
          backgroundColor: "#0a1538",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appEnv: process.env.APP_ENV ?? "development",
    apiUrl: process.env.API_URL ?? "http://localhost:8080",
    eas: {
      projectId: "f28c5a8b-891b-4fe3-9572-abdc3a52ef81",
    },
  },
});
