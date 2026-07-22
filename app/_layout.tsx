
import DefaultHeader from '@/components/layout/default-header';
import { ChatContextProvider, DialogContextProvider, LanguageModelProvider, SystemContextProvider, useSystem } from "@/context";
import { Buffer } from "buffer";
import { Stack, type NativeStackHeaderProps } from "expo-router";
import { Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "react-native-url-polyfill/auto";

(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

function RootLayout() {
  return (
    <SystemContextProvider>
      <LanguageModelProvider>
        <ChatContextProvider>
          <DialogContextProvider>
            <RootLayoutContent />
          </DialogContextProvider>
        </ChatContextProvider>
      </LanguageModelProvider>
    </SystemContextProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme } = useSystem();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/*
          navigationBarTranslucent MUST match the app's edge-to-edge config
          (edgeToEdgeEnabled=true, transparent navigationBarColor). Without it,
          keyboard-controller subtracts the navigation-bar inset from the
          reported keyboard height (KeyboardAnimationCallback.getCurrentKeyboardHeight),
          so on edge-to-edge Android (15/16) the composer is left under-lifted by
          the nav-bar height and its bottom slice sits behind the keyboard.
        */}
        <KeyboardProvider navigationBarTranslucent>
          <StatusBar backgroundColor={colorScheme.surface} />
          <SafeAreaView
            edges={Platform.OS === "android" ? ["top", "bottom"] : []}
            style={{ flex: 1, backgroundColor: colorScheme.surface }}
        >
            <Stack
              screenOptions={{
                header: (props: NativeStackHeaderProps) => <DefaultHeader {...props} />,
                contentStyle: {
                  backgroundColor: colorScheme.surface,
                },
              }}
            >
              <Stack.Screen
                name="chat"
                options={{
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  headerShown: true
                }}
              />
            </Stack>
          </SafeAreaView>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;