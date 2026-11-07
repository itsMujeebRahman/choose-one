import { Platform, StyleSheet, View } from "react-native";
import { BlurView, type BlurViewProps } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { useTheme } from "../../theme/theme";

const useLiquidGlass =
  Platform.OS === "ios" &&
  isGlassEffectAPIAvailable() &&
  isLiquidGlassAvailable();
export default function TabBarBackground({
  target,
  borderRadius = 36,
}: {
  target: NonNullable<BlurViewProps["blurTarget"]>;
  borderRadius?: number;
}) {
  const { isDark } = useTheme();
  if (useLiquidGlass) {
    return (
      <GlassView
        pointerEvents="none"
        style={[styles.glass, { borderRadius }]}
        glassEffectStyle="regular"
        colorScheme={isDark ? "dark" : "light"}
        tintColor={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)"}
      />
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[
        styles.frosted,
        {
          borderRadius,
          borderColor: isDark
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.6)",
          backgroundColor: isDark
            ? "rgba(17,18,22,0.75)"
            : "rgba(255,255,255,0.25)",
        },
      ]}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        tint={isDark ? "dark" : "light"}
        intensity={65}
        blurTarget={target}
        blurMethod="dimezisBlurViewSdk31Plus"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  glass: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 36,
  },
  frosted: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
