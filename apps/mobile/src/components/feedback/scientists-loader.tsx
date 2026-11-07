import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const scientists = require("../../../assets/doodleVideo/potato-scientists-transparent.webp");
const scientistsPlaceholder = require("../../../assets/doodleVideo/potato-scientists-placeholder.png");
const AnimatedImage = Animated.createAnimatedComponent(Image);

export function preloadScientistsLoader() {
  return Image.loadAsync(scientists);
}

type Props = {
  accessibilityLabel?: string;
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ScientistsLoader({
  accessibilityLabel = "Three doodle potato scientists discussing options in a lab while loading",
  decorative = false,
  style,
}: Props) {
  const [animationReady, setAnimationReady] = useState(false);
  const reveal = useSharedValue(0);

  useEffect(() => {
    // Safety fallback: ensure animation reveals even if onLoadEnd doesn't fire
    const timer = setTimeout(() => setAnimationReady(true), 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    reveal.value = withTiming(animationReady ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [animationReady, reveal]);

  const animationStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
  }));
  const placeholderStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value,
  }));

  return (
    <View
      accessible={!decorative}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? "no-hide-descendants" : "auto"}
      accessibilityRole={decorative ? undefined : "progressbar"}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      style={[s.frame, style]}
    >
      <AnimatedImage
        source={scientistsPlaceholder}
        contentFit="contain"
        style={[StyleSheet.absoluteFill, placeholderStyle]}
      />
      <AnimatedImage
        source={scientists}
        contentFit="contain"
        autoplay
        recyclingKey="potato-scientists-loader"
        transition={0}
        onLoad={() => setAnimationReady(true)}
        onLoadEnd={() => setAnimationReady(true)}
        style={[StyleSheet.absoluteFill, animationStyle]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  frame: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 16 / 9,
    alignSelf: "center",
  },
});
