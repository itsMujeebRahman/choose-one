import { Platform, StyleSheet, View } from "react-native";
import { BlurView, type BlurViewProps } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";

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
  if (useLiquidGlass) {
    return (
      <GlassView
        pointerEvents="none"
        style={[styles.glass, { borderRadius }]}
        glassEffectStyle="regular"
        colorScheme="light"
        tintColor="rgba(255,255,255,0.15)"
      />
    );
  }
  return (
    <View pointerEvents="none" style={[styles.frosted, { borderRadius }]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        tint="light"
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
