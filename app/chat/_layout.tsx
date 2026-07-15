import Header from "@/components/layout/chat-header";
import DrawerContent from "@/components/layout/drawer-content";
import { useSystem } from "@/context";
import { DrawerContentComponentProps, DrawerHeaderProps } from "@react-navigation/drawer";
import Drawer from "expo-router/drawer";
import { useWindowDimensions } from "react-native";

function ChatLayout() {
  const { colorScheme } = useSystem();
  const { width } = useWindowDimensions();

  return (
    <Drawer
      screenOptions={{
        header: (props: DrawerHeaderProps) => <Header {...props} />,
        swipeEnabled: true,
        // Activate the drawer swipe from the left half of the screen. Covering
        // the whole width (a huge value) makes the drawer's pan gesture track
        // touches on the header too, which suppresses the native ripple on the
        // hamburger/settings icons; keeping it to half leaves those clear.
        swipeEdgeWidth: width / 2,
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
