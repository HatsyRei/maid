import { TextStyle } from "react-native";

export type TypographyRole =
  | "displayLarge"
  | "displayMedium"
  | "displaySmall"
  | "headlineLarge"
  | "headlineMedium"
  | "headlineSmall"
  | "titleLarge"
  | "titleMedium"
  | "titleSmall"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall"
  | "labelLarge"
  | "labelMedium"
  | "labelSmall";

// Material 3 type scale.
// https://m3.material.io/styles/typography/type-scale-tokens
export const typography: Record<TypographyRole, TextStyle> = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: "400", letterSpacing: -0.25 },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: "400", letterSpacing: 0 },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: "400", letterSpacing: 0 },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: "400", letterSpacing: 0 },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: "400", letterSpacing: 0 },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: "400", letterSpacing: 0 },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: "400", letterSpacing: 0 },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15 },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1 },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: "400", letterSpacing: 0.5 },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: "400", letterSpacing: 0.25 },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: "400", letterSpacing: 0.4 },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.5 },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: "500", letterSpacing: 0.5 },
};

export default typography;
