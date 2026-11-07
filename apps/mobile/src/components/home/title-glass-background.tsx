import type { ComponentType, ReactElement } from "react";
import { StyleSheet, type ViewProps } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView, type BlurViewProps } from "expo-blur";
import { useTheme } from "../../theme/theme";

// The package's legacy NativeMethods class typing predates RN 0.88's element refs.
const GradientMask = MaskedView as unknown as ComponentType<
  ViewProps & { maskElement: ReactElement }
>;

type Props = {
  target: NonNullable<BlurViewProps["blurTarget"]>;
  height: number;
};

export default function TitleGlassBackground({ target, height }: Props) {
  const { isDark } = useTheme();
  return (
    <GradientMask
      pointerEvents="none"
      style={[styles.background, { height }]}
      maskElement={
        <LinearGradient
          colors={["black", "black", "transparent"]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      }
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurTarget={target}
        blurMethod="dimezisBlurViewSdk31Plus"
        tint={isDark ? "dark" : "light"}
        intensity={65}
      />
    </GradientMask>
  );
}
const styles = StyleSheet.create({
  background: { position: "absolute", top: 0, left: 0, right: 0 },
});
