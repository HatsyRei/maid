import { MaterialIconButton } from "@/components/buttons/icon-button";
import ModelDropdown from "@/components/dropdowns/model-dropdown";
import { useSystem } from "@/context";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

function Header(props: DrawerHeaderProps) {
  const router = useRouter();
  const { colorScheme } = useSystem();

  const styles = StyleSheet.create({
    root: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingLeft: 8,
      paddingRight: 16,
      paddingTop: 12,
      paddingBottom: 4,
      backgroundColor: colorScheme.surface,
    },
    spacer: {
      flex: 1,
    },
  });

  return (
    <View style={styles.root}>
      <MaterialIconButton
        testID="open-drawer-button"
        icon="menu"
        size={26}
        onPress={props.navigation.openDrawer}
      />
      <ModelDropdown small />
      <View style={styles.spacer} />
      <MaterialIconButton
        testID="settings-button"
        icon="settings"
        size={20}
        onPress={() => router.push("/settings")}
      />
    </View>
  );
}

export default Header;