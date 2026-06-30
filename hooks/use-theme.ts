import { ColorScheme, createColorScheme } from "@/utilities/color-scheme";

interface ThemeData {
  colorScheme: ColorScheme;
}

const DEFAULT_ACCENT_COLOR = "#2196F3";
const COLOR_SCHEME = createColorScheme(DEFAULT_ACCENT_COLOR, "dark");

function useTheme(): ThemeData {
  return {
    colorScheme: COLOR_SCHEME,
  };
}

export default useTheme;