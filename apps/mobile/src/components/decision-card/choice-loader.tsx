import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors as c, fonts as f } from "../../theme/tokens";

export const potatoScientists = require("../../../assets/doodleVideo/potato-scientists-transparent.webp");
const potatoScientistsPlaceholder = require("../../../assets/doodleVideo/potato-scientists-placeholder.png");
const AnimatedImage = Animated.createAnimatedComponent(Image);

export function preloadChoiceSticker() {
  return Image.loadAsync(potatoScientists);
}

export default function ChoiceLoader() {
  const [animationReady, setAnimationReady] = useState(false);
  const animationOpacity = useSharedValue(0);
  useEffect(() => {
    animationOpacity.value = withTiming(animationReady ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [animationOpacity, animationReady]);
  const animationStyle = useAnimatedStyle(() => ({
    opacity: animationOpacity.value,
  }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Thinking through your options"
      accessibilityLiveRegion="polite"
      style={s.container}
    >
      <View style={s.sticker}>
        <AnimatedImage
          source={potatoScientistsPlaceholder}
          contentFit="contain"
          style={StyleSheet.absoluteFill}
        />
        <AnimatedImage
          source={potatoScientists}
          contentFit="contain"
          autoplay
          recyclingKey="potato-scientists-loader"
          transition={300}
          onLoadEnd={() => setAnimationReady(true)}
          style={[StyleSheet.absoluteFill, animationStyle]}
          accessibilityLabel="Animated potato scientists thinking through your options"
        />
      </View>
      <Text style={s.title}>A little potato deliberation…</Text>
      <Text style={s.body}>Our tiny scientists are weighing your options.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  container: {
    paddingVertical: 12,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    overflow: "visible",
  },
  sticker: { width: "100%", aspectRatio: 16 / 9 },
  title: {
    fontFamily: f.medium,
    fontSize: 20,
    color: c.ink,
    textAlign: "center",
  },
  body: {
    fontFamily: f.regular,
    fontSize: 14,
    color: c.muted,
    textAlign: "center",
  },
});
