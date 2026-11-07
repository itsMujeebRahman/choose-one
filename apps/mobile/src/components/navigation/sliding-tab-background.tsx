import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import type { BlurViewProps } from "expo-blur";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import TabBarBackground from "./tab-bar-background";
import { useTheme } from "../../theme/theme";

export default function SlidingTabBackground({
  target,
  activeIndex,
  width,
  count = 2,
}: {
  target: NonNullable<BlurViewProps["blurTarget"]>;
  activeIndex: number;
  width: number;
  count?: number;
}) {
  const { isDark } = useTheme();
  const tabWidth = width / count;
  const offset = useSharedValue(activeIndex * tabWidth);
  useEffect(() => {
    offset.value = withTiming(activeIndex * tabWidth, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [activeIndex, tabWidth, offset]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <TabBarBackground target={target} />
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth - 16,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.14)"
              : "rgba(235,220,210,0.65)",
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    left: 8,
    top: 8,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(235,220,210,0.65)",
  },
});
