import { useSystem } from "@/context";
import { ReactNode, useMemo, useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const EDGE_PADDING = 8;
const GAP = 6;

type PopoverPosition = "top" | "bottom" | "left" | "right" | "center";
type PopoverAlign = "start" | "center" | "end";

interface PopoverViewProps {
  testID?: string;
  position: PopoverPosition;
  /**
   * For bottom/top: controls horizontal alignment relative to the anchor
   * For left/right: controls vertical alignment relative to the anchor
   */
  align?: PopoverAlign;
  /** Pixel offset applied after alignment (useful for nudging below, etc.) */
  offset?: { x?: number; y?: number };

  anchor: LayoutRectangle | null;
  width: number;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

function Popover({
  testID,
  position,
  align = "center",
  offset,
  anchor,
  width,
  visible,
  onClose,
  children,
}: PopoverViewProps) {
  const { colorScheme } = useSystem();
  const [popoverH, setPopoverH] = useState(0);
  // Actual drawable area of the Modal window. Measured via onLayout so the
  // clamp matches exactly what is visible (excluding the Android navigation
  // bar) regardless of edge-to-edge / status-bar configuration. Dimensions is
  // only used as the initial value before the first layout pass.
  const [container, setContainer] = useState(() => {
    const { width: w, height: h } = Dimensions.get("window");
    return { width: w, height: h };
  });

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setContainer((prev) => (prev.width !== w || prev.height !== h ? { width: w, height: h } : prev));
  };

  const onPopoverLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== popoverH) setPopoverH(h);
  };

  const popoverPositionStyle = useMemo(() => {
    const offX = offset?.x ?? 0;
    const offY = offset?.y ?? 0;

    const screenW = container.width;
    const screenH = container.height;

    // Bounds are the measured container inset by EDGE_PADDING, so the popover
    // never sits behind the Android navigation bar (which lies outside the
    // measured container).
    const minLeft = EDGE_PADDING;
    const maxLeft = screenW - width - EDGE_PADDING;
    const minTop = EDGE_PADDING;
    const maxTop = screenH - popoverH - EDGE_PADDING;

    if (!anchor) {
      return { top: minTop + offY, left: minLeft + offX };
    }

    // Horizontal align helpers (for top/bottom)
    const leftStart = anchor.x;
    const leftCenter = anchor.x + anchor.width / 2 - width / 2;
    const leftEnd = anchor.x + anchor.width - width;

    const alignedLeftRaw =
      align === "start" ? leftStart : align === "end" ? leftEnd : leftCenter;

    // Vertical align helpers (for left/right)
    const topStart = anchor.y;
    const topCenter = anchor.y + anchor.height / 2 - popoverH / 2;
    const topEnd = anchor.y + anchor.height - popoverH;

    const alignedTopRaw =
      align === "start" ? topStart : align === "end" ? topEnd : topCenter;

    // Compute top/left per position, then apply offsets + clamp. The
    // inset-aware clamp below shifts the popover up by only the minimum needed
    // to clear the navigation bar, keeping it as close to the anchor (e.g. the
    // long-press point) as possible instead of flipping it fully to the far side.
    let left = 0;
    let top = 0;

    switch (position) {
      case "bottom":
        left = alignedLeftRaw;
        top = anchor.y + anchor.height + GAP;
        break;

      case "top":
        left = alignedLeftRaw;
        top = anchor.y - popoverH - GAP; // uses popoverH; first render may adjust after layout
        break;

      case "right":
        left = anchor.x + anchor.width + GAP;
        top = alignedTopRaw;
        break;

      case "left":
        left = anchor.x - width - GAP;
        top = alignedTopRaw;
        break;

      case "center":
        // Center the popover on the anchor point (used for long-press menus so
        // the menu appears right under the finger rather than offset from it).
        left = anchor.x + anchor.width / 2 - width / 2;
        top = anchor.y + anchor.height / 2 - popoverH / 2;
        break;
    }

    left = clamp(left + offX, minLeft, maxLeft);
    top = clamp(top + offY, minTop, maxTop);

    return { left, top };
  }, [
    anchor,
    position,
    align,
    offset?.x,
    offset?.y,
    popoverH,
    container.width,
    container.height,
    width,
  ]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: { flex: 1, backgroundColor: "transparent" },
        container: { flex: 1 },
        popoverBase: {
          position: "absolute",
          width: width,
          backgroundColor: colorScheme.surfaceVariant,
          borderRadius: 16,
          paddingVertical: 8,
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
      }),
    [colorScheme.surfaceVariant, width]
  );

  return (
    <Modal
      testID={testID}
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.container} onLayout={onContainerLayout}>
            <TouchableWithoutFeedback>
              <View onLayout={onPopoverLayout} style={[styles.popoverBase, popoverPositionStyle]}>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default Popover;
