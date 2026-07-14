import { argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities";

export type Brightness = "light" | "dark";

export interface ColorScheme {
  brightness: Brightness;

  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface & background
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  // Tonal surface containers (Material 3 elevation)
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Utility
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;

  // Inverse roles
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

export function createColorScheme(seedColor: string, brightness: Brightness = "light"): ColorScheme {
  const cleanedSeedColor = `#${seedColor.replace(/^#/, '').slice(0, 6)}`;

  const theme = themeFromSourceColor(argbFromHex(cleanedSeedColor));

  const scheme = brightness === "light" ? theme.schemes.light : theme.schemes.dark;

  const isLight = brightness === "light";
  const neutralTone = (tone: number) => hexFromArgb(theme.palettes.neutral.tone(tone));

  return {
    brightness,
    primary: hexFromArgb(scheme.primary),
    onPrimary: hexFromArgb(scheme.onPrimary),
    primaryContainer: hexFromArgb(scheme.primaryContainer),
    onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
    secondary: hexFromArgb(scheme.secondary),
    onSecondary: hexFromArgb(scheme.onSecondary),
    secondaryContainer: hexFromArgb(scheme.secondaryContainer),
    onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
    tertiary: hexFromArgb(scheme.tertiary),
    onTertiary: hexFromArgb(scheme.onTertiary),
    tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
    onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
    error: hexFromArgb(scheme.error),
    onError: hexFromArgb(scheme.onError),
    errorContainer: hexFromArgb(scheme.errorContainer),
    onErrorContainer: hexFromArgb(scheme.onErrorContainer),
    surface: hexFromArgb(scheme.surface - 0x00101010),
    onSurface: hexFromArgb(scheme.onSurface),
    surfaceVariant: hexFromArgb(scheme.surfaceVariant - 0x00303030),
    onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
    surfaceContainerLowest: neutralTone(isLight ? 100 : 4),
    surfaceContainerLow: neutralTone(isLight ? 96 : 10),
    surfaceContainer: neutralTone(isLight ? 94 : 12),
    surfaceContainerHigh: neutralTone(isLight ? 92 : 17),
    surfaceContainerHighest: neutralTone(isLight ? 90 : 22),
    outline: hexFromArgb(scheme.outline),
    outlineVariant: hexFromArgb(scheme.outlineVariant),
    shadow: hexFromArgb(scheme.shadow),
    scrim: hexFromArgb(scheme.scrim),
    inverseSurface: hexFromArgb(scheme.inverseSurface),
    inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
    inversePrimary: hexFromArgb(scheme.inversePrimary),
  };
}