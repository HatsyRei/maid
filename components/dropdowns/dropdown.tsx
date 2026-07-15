import { useSystem } from "@/context";
import { typography } from "@/utilities/typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { Fragment, useRef, useState } from "react";
import {
  Dimensions,
  LayoutRectangle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface DropdownItem<T> {
  label: string | React.ReactNode;
  selectedLabel?: string | React.ReactNode;
  value: T;
}

interface DropdownProps<T> {
  items: DropdownItem<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  equalityFn?: (a: T, b: T) => boolean;
}

const POPOVER_MIN_WIDTH = 220;
const POPOVER_VERT_GAP = 8;
const POPOVER_MAX_HEIGHT = 400;

function Dropdown<T>({
  items,
  selectedValue,
  onValueChange,
  equalityFn,
}: DropdownProps<T>) {
  const { colorScheme } = useSystem();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const rootRef = useRef<View>(null);

  const selectedItem =
    items.find((item) => equalityFn ? equalityFn(item.value, selectedValue) : item.value == selectedValue) ?? items[0];

  const openMenu = () => {
    if (rootRef.current) {
      rootRef.current.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setOpen(true);
      });
    } else {
      setAnchor(null);
      setOpen(true);
    }
  };

  const closeMenu = () => setOpen(false);

  const styles = StyleSheet.create({
    rootWrapper: {
      alignSelf: "stretch",
    },
    root: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colorScheme.secondaryContainer,
      borderRadius: 20,
      paddingLeft: 16,
      paddingRight: 6,
      paddingVertical: 6,
    },
    label: {
      ...typography.labelLarge,
      color: colorScheme.onSecondaryContainer,
      flexShrink: 1,
      maxWidth: 160,
    },
    caret: {
      marginLeft: 2,
    },
    overlay: { 
      flex: 1, 
      backgroundColor: "transparent" 
    },
    popover: {
      position: "absolute",
      backgroundColor: colorScheme.surfaceVariant,
      borderRadius: 16,
      paddingVertical: 8,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    itemBtn: {
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    itemText: {
      ...typography.labelLarge,
      color: colorScheme.onSurface,
    },
    itemTextSelected: {
      color: colorScheme.primary,
    },
  });

  // Compute popover position based on anchor, with clamping
  const popoverStyle = (() => {
    const screen = Dimensions.get("window");
    if (!anchor) {
      return { bottom: 0, left: 0, width: POPOVER_MIN_WIDTH, maxHeight: POPOVER_MAX_HEIGHT };
    }
    const width = Math.max(POPOVER_MIN_WIDTH, anchor.width);
    let left = anchor.x + anchor.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, screen.width - width - 8));

    // Always sit directly below the pill; cap height to the available space.
    const top = anchor.y + anchor.height + POPOVER_VERT_GAP;
    const maxHeight = Math.min(POPOVER_MAX_HEIGHT, screen.height - top - 8);

    return { top, left, width, maxHeight };
  })();

  const Popover = (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={closeMenu}
    >
      <TouchableWithoutFeedback onPress={closeMenu}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <ScrollView style={[styles.popover, popoverStyle]}>
              {items.map((item, idx) => {
                const selected = equalityFn
                  ? equalityFn(item.value, selectedValue)
                  : item.value == selectedValue;
                return (
                  <Fragment key={`${item.label}-${idx}`}>
                    <Pressable
                      style={({ pressed }) => [styles.itemBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => {
                        onValueChange(item.value);
                        closeMenu();
                      }}
                    >
                      {typeof item.label === "string" ? (
                        <Text
                          style={[styles.itemText, selected && styles.itemTextSelected]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.label}
                        </Text>
                      ) : (
                        item.label
                      )}
                    </Pressable>
                  </Fragment>
                );
              })}
            </ScrollView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (selectedItem && !selectedItem.selectedLabel) {
    selectedItem.selectedLabel = selectedItem.label;
  }

  return (
    <View ref={rootRef} style={styles.rootWrapper} collapsable={false}>
      <Pressable style={({ pressed }) => [styles.root, pressed && { opacity: 0.7 }]} onPress={openMenu}>
        {typeof selectedItem?.selectedLabel === "string" ? (
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {selectedItem.selectedLabel}
          </Text>
        ) : (
          selectedItem?.selectedLabel
        )}
        <MaterialIcons
          name={open ? "arrow-drop-up" : "arrow-drop-down"}
          size={24}
          color={colorScheme.onSecondaryContainer}
          style={styles.caret}
        />
      </Pressable>
      {open && Popover}
    </View>
  );
}

export default Dropdown;