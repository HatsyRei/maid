import { MaterialIconButton } from "@/components/buttons/icon-button";
import MenuButton from "@/components/buttons/menu-button";
import ModelDropdown from "@/components/dropdowns/model-dropdown";
import { useSystem } from "@/context";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { StyleSheet, View } from "react-native";

function Header(props: DrawerHeaderProps) {
  const { colorScheme } = useSystem();

  const styles = StyleSheet.create({
    root: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingTop: 12,
      paddingBottom: 4,
      backgroundColor: colorScheme.surface,
    },
  });

  return (
    <View style={styles.root}>
      <MaterialIconButton
        testID="open-drawer-button"
        icon="menu"
        size={28}
        onPress={props.navigation.openDrawer}
      />
      <ModelDropdown small />
      <MenuButton />
    </View>
  );
}

export default Header;