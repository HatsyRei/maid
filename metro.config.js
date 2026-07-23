const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// `expo-router` pulls in `expo-symbols`, which statically imports the
// ~960KB MaterialSymbols_400Regular.ttf from `@expo-google-fonts/material-symbols`.
// The app never renders `<SymbolView>` / native tabs, so that font is dead
// weight in the APK. Resolve the font package to an empty module so Metro drops
// the .ttf asset from the bundle. Safe because the font is only loaded lazily
// (via loadAsync) when a SymbolView actually mounts, which never happens here.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@expo-google-fonts/material-symbols')) {
    return { type: 'empty' };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
