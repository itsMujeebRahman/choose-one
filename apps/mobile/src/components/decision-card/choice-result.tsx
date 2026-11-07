import { StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import DecisionButton from "./decision-button";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

const answerColorKeys = [
  "yellow",
  "lavender",
  "mint",
  "blue",
  "coral",
] as const;

export const answerColorCount = answerColorKeys.length;

export function getAnswerColors(colors: ThemeColors) {
  return answerColorKeys.map((key) => colors[key]);
}

type Props = { answer: string; colorIndex: number; onStartNew: () => void };
export default function ChoiceResult({
  answer,
  colorIndex,
  onStartNew,
}: Props) {
  const [s, c] = useThemeStyles(createStyles);
  const reveal = useSharedValue(0);
  useEffect(() => {
    reveal.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [reveal]);
  const revealStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 14 }],
  }));
  return (
    <Animated.View
      entering={FadeInDown.duration(420).springify().damping(18)}
      style={[s.container, revealStyle]}
    >
      <View
        style={[s.answer, { backgroundColor: getAnswerColors(c)[colorIndex] }]}
        accessibilityLiveRegion="polite"
      >
        <Text style={s.eyebrow}>YOUR ONE LITTLE CHOICE</Text>
        <Text selectable style={s.title}>
          {answer}
        </Text>
        <Text style={s.body}>
          A nudge to get you started. The choice is still yours.
        </Text>
      </View>
      <DecisionButton
        label="Anything else bothering you?"
        secondary
        onPress={onStartNew}
      />
    </Animated.View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { marginTop: 24, gap: 12 },
    answer: {
      borderRadius: 36,
      padding: 24,
      marginBottom: 8,
    },
    eyebrow: {
      fontFamily: f.medium,
      color: c.muted,
      fontSize: 10,
      letterSpacing: 1.5,
    },
    title: {
      fontFamily: f.medium,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.8,
      color: c.ink,
      marginTop: 18,
    },
    body: {
      fontFamily: f.regular,
      fontSize: 14,
      lineHeight: 21,
      color: c.muted,
      marginTop: 16,
    },
  });
