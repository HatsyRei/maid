import PromptInputGroup from "@/components/groups/prompt-input-group";
import MessageView from "@/components/views/message/message-view";
import { useChat, useSystem } from "@/context";
import { getConversation, hasNode, MessageNode } from "message-nodes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, NativeScrollEvent, NativeSyntheticEvent, PanResponder, StyleSheet, View } from "react-native";

const MIN_SCROLL_THUMB_HEIGHT = 40;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function Chat() {
  const { colorScheme } = useSystem();
  const { mappings, root } = useChat();
  const listRef = useRef<FlatList<MessageNode>>(null);
  const dragStartOffsetRef = useRef(0);
  const metricsRef = useRef({
    offset: 0,
    contentHeight: 0,
    viewportHeight: 0,
  });
  const thumbTop = useRef(new Animated.Value(0)).current;
  const thumbHeight = useRef(new Animated.Value(MIN_SCROLL_THUMB_HEIGHT)).current;
  const lastThumbTopRef = useRef(0);
  const lastThumbHeightRef = useRef(MIN_SCROLL_THUMB_HEIGHT);
  const [showScrollThumb, setShowScrollThumb] = useState(false);
  const showScrollThumbRef = useRef(showScrollThumb);
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

  const getThumbHeight = () => {
    const { contentHeight, viewportHeight } = metricsRef.current;

    if (contentHeight <= 0 || viewportHeight <= 0) {
      return MIN_SCROLL_THUMB_HEIGHT;
    }

    return Math.max(MIN_SCROLL_THUMB_HEIGHT, (viewportHeight * viewportHeight) / contentHeight);
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
      thumbHeight.setValue(MIN_SCROLL_THUMB_HEIGHT);
      lastThumbTopRef.current = 0;
      lastThumbHeightRef.current = MIN_SCROLL_THUMB_HEIGHT;
      return;
    }

    setThumbVisibility(true);
    const nextThumbHeight = getThumbHeight();
    const maxThumbTravel = Math.max(viewportHeight - nextThumbHeight, 0);
    const clampedOffset = clamp(offset, 0, maxScroll);
    const nextThumbTop = maxScroll === 0 ? 0 : (clampedOffset / maxScroll) * maxThumbTravel;

    if (Math.abs(nextThumbHeight - lastThumbHeightRef.current) > 0.5) {
      thumbHeight.setValue(nextThumbHeight);
      lastThumbHeightRef.current = nextThumbHeight;
    }

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

      dragStartOffsetRef.current = metricsRef.current.offset;
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

      const currentThumbHeight = getThumbHeight();
      const maxThumbTravel = Math.max(viewportHeight - currentThumbHeight, 1);
      const scrollDelta = (gestureState.dy / maxThumbTravel) * maxScroll;

      scrollToOffset(dragStartOffsetRef.current + scrollDelta);
    },
  }), [root]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!root) {
      return;
    }

    metricsRef.current.offset = event.nativeEvent.contentOffset.y;
    updateThumbPosition();
  };

  const handleContentSizeChange = (_: number, height: number) => {
    metricsRef.current.contentHeight = height;
    updateThumbPosition();
  };

  const handleListLayout = (height: number) => {
    metricsRef.current.viewportHeight = height;
    updateThumbPosition();
  };

  useEffect(() => {
    if (!root) {
      setThumbVisibility(false);
      return;
    }

    metricsRef.current.offset = 0;
    metricsRef.current.contentHeight = 0;
    thumbTop.setValue(0);
    thumbHeight.setValue(MIN_SCROLL_THUMB_HEIGHT);
    lastThumbTopRef.current = 0;
    lastThumbHeightRef.current = MIN_SCROLL_THUMB_HEIGHT;

    requestAnimationFrame(() => {
      scrollToOffset(0);
    });
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
      right: 0,
      bottom: 0,
      width: 32,
      pointerEvents: "box-none",
    },
    scrollThumb: {
      position: "absolute",
      right: 0,
      width: 24,
      paddingRight: 6,
      alignItems: "flex-end",
    },
    scrollThumbVisual: {
      width: 6,
      borderRadius: 3,
      opacity: 0.9,
    },
  }), [colorScheme]);

  if (root && !hasNode(mappings, root)) {
    console.warn(`No conversation found for id ${root}`);
  }

  return (
    <View
      testID="chat-page"
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
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={32}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={15}
        /> : <View style={styles.list} />}
        {showScrollThumb && <View style={styles.scrollIndicatorContainer}>
          <Animated.View
            testID="chat-scroll-thumb"
            style={[
              styles.scrollThumb,
              {
                height: thumbHeight,
                transform: [{ translateY: thumbTop }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View
              style={[
                styles.scrollThumbVisual,
                { backgroundColor: colorScheme.outline, height: "100%" },
              ]}
            />
          </Animated.View>
        </View>}
      </View>
      <PromptInputGroup />
    </View>
  );
}

export default Chat;
