import {
  useCallback,
  useEffect,
  useRef,
  type ComponentProps,
  type ComponentRef,
} from "react";
import { Keyboard, ScrollView, TextInput } from "react-native";

type Props = ComponentProps<typeof ScrollView> & { headerHeight: number };

export default function KeyboardAwareScrollView({
  headerHeight,
  ...props
}: Props) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const lastTarget = useRef<{ input: unknown; y: number } | null>(null);
  const revealInput = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    const request = ++revision.current;
    // Focus, the new field's layout, and keyboard resize can arrive together.
    // Measure once after they settle, rather than scrolling for each event.
    timer.current = setTimeout(() => {
      timer.current = null;
      const input = TextInput.State.currentlyFocusedInput();
      if (!input || !scroll.current) return;
      const measuredOffset = offset.current;
      scroll.current.measureInWindow((_x, top, _width, height) => {
        input.measureInWindow((_inputX, y, _inputWidth, inputHeight) => {
          if (
            revision.current !== request ||
            TextInput.State.currentlyFocusedInput() !== input
          )
            return;
          // Ignore measurements taken while another scroll was moving the page.
          if (Math.abs(offset.current - measuredOffset) > 2) return;
          const keyboardTop = Keyboard.metrics()?.screenY ?? top + height;
          const visibleBottom = Math.min(top + height, keyboardTop) - 88;
          const delta = y + inputHeight - visibleBottom;
          // Only reveal what is covered; never pull the page back toward the header.
          if (delta <= 2) return;
          const target = Math.max(0, measuredOffset + delta);
          if (
            lastTarget.current?.input === input &&
            Math.abs(lastTarget.current.y - target) < 4
          )
            return;
          lastTarget.current = { input, y: target };
          scroll.current?.scrollTo({ y: target, animated: true });
        });
      });
    }, 100);
  }, []);
  const cancelReveal = useCallback(() => {
    ++revision.current;
    if (timer.current !== null) clearTimeout(timer.current);
    lastTarget.current = null;
  }, []);
  useEffect(() => {
    const shown = Keyboard.addListener("keyboardDidShow", revealInput);
    const changed = Keyboard.addListener("keyboardDidChangeFrame", revealInput);
    const hidden = Keyboard.addListener("keyboardDidHide", cancelReveal);
    return () => {
      shown.remove();
      changed.remove();
      hidden.remove();
      cancelReveal();
    };
  }, [revealInput, cancelReveal]);
  return (
    <ScrollView
      {...props}
      ref={scroll}
      onFocus={revealInput}
      onLayout={revealInput}
      onScroll={(event) => {
        offset.current = event.nativeEvent.contentOffset.y;
      }}
      onScrollBeginDrag={cancelReveal}
      scrollEventThrottle={16}
      keyboardDismissMode="none"
      scrollIndicatorInsets={{ top: headerHeight }}
    />
  );
}
