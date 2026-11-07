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

const fight = require("../../../assets/doodleVideo/cute-fight-transparent.webp");
const fightPlaceholder = require("../../../assets/doodleVideo/cute-fight-placeholder.png");
const AnimatedImage = Animated.createAnimatedComponent(Image);

export function preloadFightLoader() {
  return Image.loadAsync(fight);
}

type Props = {
  accessibilityLabel?: string;
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function FightLoader({
  accessibilityLabel = "Two doodle characters playfully fighting while loading",
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
        source={fightPlaceholder}
        contentFit="contain"
        style={[StyleSheet.absoluteFill, placeholderStyle]}
      />
      <AnimatedImage
        source={fight}
        contentFit="contain"
        autoplay
        recyclingKey="cute-fight-loader"
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
