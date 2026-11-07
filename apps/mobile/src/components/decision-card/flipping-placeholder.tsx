import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { fonts, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

const examples = [
  "Restaurant confusion",
  "Confused about a movie?",
  "What should I do this weekend?",
];
const faceHeight = 24;

function CubeFace({
  slot,
  text,
  progress,
}: {
  slot: number;
  text: string;
  progress: SharedValue<number>;
}) {
  const [styles] = useThemeStyles(createStyles);
  const animatedStyle = useAnimatedStyle(() => {
    const phase = (progress.value + slot) % 2;
    // Reposition only at the edge-on, hidden point. The visible face never resets.
    const angle = phase < 1 ? phase * 90 : (phase - 2) * 90;
    return {
      opacity: Math.abs(angle) >= 89.9 ? 0 : 1,
      transform: [
        { perspective: 400 },
        { translateY: (-faceHeight / 2) * Math.sin((angle * Math.PI) / 180) },
        { rotateX: `${angle}deg` },
      ],
    };
  });
  return (
    <Animated.Text numberOfLines={1} style={[styles.face, animatedStyle]}>
      {text}
    </Animated.Text>
  );
}

type FlippingPlaceholderProps = {
  placeholders?: string[];
};

export default function FlippingPlaceholder({
  placeholders = examples,
}: FlippingPlaceholderProps = {}) {
  const [styles] = useThemeStyles(createStyles);
  const items = placeholders.length >= 2 ? placeholders : examples;
  const [faces, setFaces] = useState<[string, string]>([items[0], items[1]]);
  const progress = useSharedValue(0);
  useEffect(() => {
    let mounted = true;
    let turn = 0;
    function prepareHiddenFace(completedTurn: number) {
      if (!mounted) return;
      const hiddenSlot = (completedTurn + 1) % 2;
      setFaces((current) => {
        const next: [string, string] = [...current];
        next[hiddenSlot] = items[(completedTurn + 1) % items.length];
        return next;
      });
    }
    const timer = setInterval(() => {
      turn += 1;
      const nextTurn = turn;
      // Keep rotating forward; do not reset the shared value on a React render.
      progress.value = withTiming(
        nextTurn,
        {
          duration: 650,
          easing: Easing.inOut(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          if (finished) runOnJS(prepareHiddenFace)(nextTurn);
        },
      );
    }, 2800);
    return () => {
      mounted = false;
      clearInterval(timer);
      cancelAnimation(progress);
    };
  }, [items, progress]);
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.container}
    >
      <View style={styles.cube}>
        <CubeFace slot={0} text={faces[0]} progress={progress} />
        <CubeFace slot={1} text={faces[1]} progress={progress} />
      </View>
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 16,
      right: 16,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      overflow: "hidden",
    },
    cube: { height: faceHeight, overflow: "hidden" },
    face: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: faceHeight,
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: faceHeight,
      color: c.muted,
      backgroundColor: c.surface,
      backfaceVisibility: "hidden",
    },
  });
