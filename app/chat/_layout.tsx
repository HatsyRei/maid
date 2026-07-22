import Header from "@/components/layout/chat-header";
import DrawerContent from "@/components/layout/drawer-content";
import { useSystem } from "@/context";
import Drawer, { type DrawerContentComponentProps, type DrawerHeaderProps } from "expo-router/drawer";
import { useWindowDimensions } from "react-native";

function ChatLayout() {
  const { colorScheme } = useSystem();
  const { width } = useWindowDimensions();

  return (
    <Drawer
      screenOptions={{
        header: (props: DrawerHeaderProps) => <Header {...props} />,
        swipeEnabled: true,
        // Keep opening available across the left half, but tolerate the small
        // vertical drift common in horizontal swipes over the chat list.
        swipeEdgeWidth: width / 2,
        swipeMinDistance: 24,
        configureGestureHandler: (gesture) => gesture.failOffsetY([-24, 24]),
        drawerStyle: {
          backgroundColor: `${colorScheme.surface}f0`
        },
        sceneStyle: {
          backgroundColor: colorScheme.surface,
        },
      }}
      drawerContent={(props: DrawerContentComponentProps) => <DrawerContent navigation={props.navigation} />}
    >
      <Drawer.Screen name="index" />
    </Drawer>
  );
}

export default ChatLayout;
