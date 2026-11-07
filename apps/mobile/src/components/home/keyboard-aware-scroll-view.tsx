import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
} from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  type KeyboardEvent,
} from "react-native";

type Props = ComponentProps<typeof ScrollView> & { headerHeight: number };

export default function KeyboardAwareScrollView({
  headerHeight,
  ...props
}: Props) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const keyboardHeightRef = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const revealInput = useCallback(
    (customKbHeight?: number) => {
      if (timer.current !== null) clearTimeout(timer.current);
      const request = ++revision.current;

      timer.current = setTimeout(
        () => {
          timer.current = null;
          const input = TextInput.State.currentlyFocusedInput();
          if (!input || !scroll.current) return;

          const currentOffset = offset.current;
          const windowHeight = Dimensions.get("window").height;
          const kbHeight =
            customKbHeight ??
            keyboardHeightRef.current ??
            Keyboard.metrics()?.height ??
            0;

          scroll.current.measureInWindow((_sx, sTop, _sw, sHeight) => {
            input.measureInWindow((_ix, inputY, _iw, inputHeight) => {
              if (
                revision.current !== request ||
                TextInput.State.currentlyFocusedInput() !== input
              ) {
                return;
              }

              // Top clearance: keep input safely below header
              const visibleTop = headerHeight + 16;
              // Bottom clearance: keep input and the action button ("Let's figure it out ↗") above keyboard
              const keyboardTop =
                kbHeight > 0 ? windowHeight - kbHeight : sTop + sHeight;

              // Action button is ~56px + 16px gap + 24px safety margin = ~96px below the input
              const targetBottom = inputY + inputHeight + 96;
              const visibleBottom = keyboardTop - 16;

              if (targetBottom > visibleBottom) {
                const delta = targetBottom - visibleBottom;
                const target = Math.max(0, currentOffset + delta);
                scroll.current?.scrollTo({ y: target, animated: true });
              } else if (inputY < visibleTop) {
                const delta = visibleTop - inputY;
                const target = Math.max(0, currentOffset - delta);
                scroll.current?.scrollTo({ y: target, animated: true });
              }
            });
          });
        },
        Platform.OS === "ios" ? 50 : 120,
      );
    },
    [headerHeight],
  );

  const cancelReveal = useCallback(() => {
    ++revision.current;
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const height = e.endCoordinates.height;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
      revealInput(height);
    };

    const onHide = () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      cancelReveal();
    };

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const changeEvent =
      Platform.OS === "ios"
        ? "keyboardWillChangeFrame"
        : "keyboardDidChangeFrame";

    const shown = Keyboard.addListener(showEvent, onShow);
    const hidden = Keyboard.addListener(hideEvent, onHide);
    const changed = Keyboard.addListener(changeEvent, onShow);

    return () => {
      shown.remove();
      hidden.remove();
      changed.remove();
      cancelReveal();
    };
  }, [revealInput, cancelReveal]);

  const flatStyle = StyleSheet.flatten(props.contentContainerStyle) || {};
  const basePaddingBottom =
    typeof flatStyle.paddingBottom === "number" ? flatStyle.paddingBottom : 100;

  const combinedContentContainerStyle = [
    props.contentContainerStyle,
    keyboardHeight > 0 && {
      paddingBottom: basePaddingBottom + keyboardHeight + 40,
    },
  ];

  return (
    <ScrollView
      {...props}
      ref={scroll}
      contentContainerStyle={combinedContentContainerStyle}
      onFocus={() => revealInput()}
      onScroll={(event) => {
        offset.current = event.nativeEvent.contentOffset.y;
      }}
      onScrollBeginDrag={cancelReveal}
      scrollEventThrottle={16}
      keyboardDismissMode="none"
      automaticallyAdjustKeyboardInsets={false}
      scrollIndicatorInsets={{ top: headerHeight }}
    />
  );
}
