// app.config.ts
import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: "Maid UI",
  slug: "maid",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "maid",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.hatsyrei.maid",
    // Android forces its dark theme in JS (useTheme); on iOS set it natively.
    // Kept out of the top level so prebuild doesn't warn about the missing
    // expo-system-ui dependency on Android (the key is a no-op there without it).
    userInterfaceStyle: "dark",
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
