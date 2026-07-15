
import DefaultHeader from '@/components/layout/default-header';
import { ChatContextProvider, DialogContextProvider, LanguageModelProvider, SystemContextProvider, useSystem } from "@/context";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Buffer } from "buffer";
import { Stack } from "expo-router";
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
      <StatusBar backgroundColor={colorScheme.surface} />
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
    </GestureHandlerRootView>
  );
}

export default RootLayout;