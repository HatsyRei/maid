import PromptInputGroup from "@/components/groups/prompt-input-group";
import MessageView from "@/components/views/message/message-view";
import { useChat, useLLM, useSystem } from "@/context";
import { useIsFocused } from "expo-router";
import { getConversation, hasNode, MessageNode } from "message-nodes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, PanResponder, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const SCROLL_THUMB_HEIGHT = 48;
const SCROLL_THUMB_IDLE_TIMEOUT = 1200;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function Chat() {
  const { colorScheme } = useSystem();
  const { mappings, root } = useChat();
  const { refreshModels } = useLLM();
  const isFocused = useIsFocused();
  const listRef = useRef<FlatList<MessageNode>>(null);
  const dragStartOffsetRef = useRef(0);
  const metricsRef = useRef({
    offset: 0,
    contentHeight: 0,
    viewportHeight: 0,
  });
  const thumbTop = useRef(new Animated.Value(0)).current;
  const thumbOpacity = useRef(new Animated.Value(0)).current;
  const lastThumbTopRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const [showScrollThumb, setShowScrollThumb] = useState(false);
  const showScrollThumbRef = useRef(showScrollThumb);
  const [thumbInteractive, setThumbInteractiveState] = useState(false);
  const thumbInteractiveRef = useRef(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const conversation = useMemo(
    () => (root ? getConversation(mappings, root).slice(1) : []),
    [mappings, root],
  );

  const setThumbVisibility = (visible: boolean) => {
    if (showScrollThumbRef.current === visible) {
      return;
    }

    showScrollThumbRef.current = visible;
    setShowScrollThumb(visible);
  };

  const setThumbInteractive = (interactive: boolean) => {
    if (thumbInteractiveRef.current === interactive) {
      return;
    }

    thumbInteractiveRef.current = interactive;
    setThumbInteractiveState(interactive);
  };

  const revealThumb = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setThumbInteractive(true);
    thumbOpacity.stopAnimation();
    thumbOpacity.setValue(1);

    if (draggingRef.current) {
      return;
    }

    hideTimerRef.current = setTimeout(() => {
      Animated.timing(thumbOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setThumbInteractive(false);
        }
      });
    }, SCROLL_THUMB_IDLE_TIMEOUT);
  };

  const updateThumbPosition = () => {
    if (!root) {
      setThumbVisibility(false);
      return;
    }

    const { offset, contentHeight, viewportHeight } = metricsRef.current;
    const maxScroll = Math.max(contentHeight - viewportHeight, 0);

    if (maxScroll <= 0 || viewportHeight <= 0) {
      setThumbVisibility(false);
      thumbTop.setValue(0);
      lastThumbTopRef.current = 0;
      return;
    }

    setThumbVisibility(true);
    const maxThumbTravel = Math.max(viewportHeight - SCROLL_THUMB_HEIGHT, 0);
    const clampedOffset = clamp(offset, 0, maxScroll);
    const nextThumbTop = maxScroll === 0 ? 0 : (clampedOffset / maxScroll) * maxThumbTravel;

    if (Math.abs(nextThumbTop - lastThumbTopRef.current) > 0.5) {
      thumbTop.setValue(nextThumbTop);
      lastThumbTopRef.current = nextThumbTop;
    }
  };

  const scrollToOffset = (offset: number) => {
    if (!root) {
      return;
    }

    const { contentHeight, viewportHeight } = metricsRef.current;
    const maxScroll = Math.max(contentHeight - viewportHeight, 0);
    const clampedOffset = clamp(offset, 0, maxScroll);

    metricsRef.current.offset = clampedOffset;
    listRef.current?.scrollToOffset({ offset: clampedOffset, animated: false });
    updateThumbPosition();
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !!root && showScrollThumbRef.current,
    onMoveShouldSetPanResponder: (_, gestureState) => !!root && showScrollThumbRef.current && Math.abs(gestureState.dy) > 1,
    onPanResponderGrant: () => {
      if (!root) {
        return;
      }

      draggingRef.current = true;
      dragStartOffsetRef.current = metricsRef.current.offset;
      revealThumb();
    },
    onPanResponderMove: (_, gestureState) => {
      if (!root) {
        return;
      }

      const { viewportHeight, contentHeight } = metricsRef.current;
      const maxScroll = Math.max(contentHeight - viewportHeight, 0);

      if (maxScroll <= 0 || viewportHeight <= 0) {
        return;
      }

      const maxThumbTravel = Math.max(viewportHeight - SCROLL_THUMB_HEIGHT, 1);
      const scrollDelta = (gestureState.dy / maxThumbTravel) * maxScroll;

      scrollToOffset(dragStartOffsetRef.current + scrollDelta);
    },
    onPanResponderRelease: () => {
      draggingRef.current = false;
      revealThumb();
    },
    onPanResponderTerminate: () => {
      draggingRef.current = false;
      revealThumb();
    },
  }), [root]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!root) {
      return;
    }

    metricsRef.current.offset = event.nativeEvent.contentOffset.y;
    updateThumbPosition();
    revealThumb();
  };

  const handleScrollSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!root) {
      return;
    }

    const { contentSize, layoutMeasurement, contentOffset } = event.nativeEvent;
    metricsRef.current.contentHeight = contentSize.height;
    metricsRef.current.viewportHeight = layoutMeasurement.height;
    metricsRef.current.offset = contentOffset.y;
    updateThumbPosition();
    revealThumb();
  };

  const handleContentSizeChange = (_: number, height: number) => {
    metricsRef.current.contentHeight = height;
    updateThumbPosition();
  };

  const handleListLayout = (height: number) => {
    metricsRef.current.viewportHeight = height;
    setFooterHeight(Math.max(height - 96, 0));
    updateThumbPosition();
  };

  // Refresh the model list whenever the conversation view gains focus (initial
  // launch and every return from settings). Gating on focus avoids fetching on
  // every keystroke while the endpoint is being edited in settings.
  useEffect(() => {
    if (isFocused) {
      refreshModels?.();
    }
  }, [isFocused, refreshModels]);

  useEffect(() => {
    if (!root) {
      setThumbVisibility(false);
      return;
    }

    metricsRef.current.offset = 0;
    metricsRef.current.contentHeight = 0;
    thumbTop.setValue(0);
    thumbOpacity.setValue(0);
    lastThumbTopRef.current = 0;
    setThumbInteractive(false);

    requestAnimationFrame(() => {
      scrollToOffset(0);
    });

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [root]);

  const renderItem = useCallback(({ item }: { item: MessageNode }) => (
    <MessageView message={item} />
  ), []);

  const styles = useMemo(() => StyleSheet.create({
    view: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: colorScheme.surface,
      padding: 8,
    },
    list: {
      flex: 1,
      width: "100%",
    },
    listContainer: {
      flex: 1,
      width: "100%",
      position: "relative",
    },
    scrollIndicatorContainer: {
      position: "absolute",
      top: 0,
      // Counteract the page's 8px padding so the indicator reaches the
      // physical right edge of the screen.
      right: -8,
      bottom: 0,
      // Wide, transparent hit area so the thumb stays easy to grab even
      // though the visible pill is flush against the edge.
      width: 44,
      pointerEvents: "box-none",
    },
    scrollThumb: {
      position: "absolute",
      right: 0,
      width: 44,
      // Keep the visible pill pinned to the right edge while the rest of
      // the row remains an invisible drag target.
      alignItems: "flex-end",
    },
    scrollThumbVisual: {
      width: 4,
      borderRadius: 2,
      opacity: 0.9,
    },
  }), [colorScheme]);

  if (root && !hasNode(mappings, root)) {
    console.warn(`No conversation found for id ${root}`);
  }

  return (
    <KeyboardAvoidingView
      testID="chat-page"
      behavior="padding"
      automaticOffset
      style={styles.view}
    >
      <View
        style={styles.listContainer}
        onLayout={(event) => handleListLayout(event.nativeEvent.layout.height)}
      >
        {root ? <FlatList
          key={root}
          ref={listRef}
          data={conversation}
          style={styles.list}
          keyExtractor={(item, index) => item.id?.toString() ?? String(index)}
          renderItem={renderItem}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollSettled}
          onMomentumScrollEnd={handleScrollSettled}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={15}
          ListFooterComponent={<View style={{ height: footerHeight }} />}
        /> : <View style={styles.list} />}
        {showScrollThumb && <View style={styles.scrollIndicatorContainer}>
          <Animated.View
            testID="chat-scroll-thumb"
            pointerEvents={thumbInteractive ? "auto" : "none"}
            style={[
              styles.scrollThumb,
              {
                height: SCROLL_THUMB_HEIGHT,
                opacity: thumbOpacity,
                transform: [{ translateY: thumbTop }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View
              style={[
                styles.scrollThumbVisual,
                { backgroundColor: colorScheme.outlineVariant, height: "100%" },
              ]}
            />
          </Animated.View>
        </View>}
      </View>
      <PromptInputGroup />
    </KeyboardAvoidingView>
  );
}

export default Chat;
