// app.config.ts
import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: "Maid UI",
  slug: "maid",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "maid",
  userInterfaceStyle: "automatic",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.hatsyrei.maid",
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.hatsyrei.maid",
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-asset",
    "expo-router",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#000000",
      },
    ],
    "./plugins/with-maid-android",
  ],

  experiments: {
    typedRoutes: true,
  },
});
