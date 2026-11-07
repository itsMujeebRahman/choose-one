import { StyleSheet, Text, View } from "react-native";
import FightLoader, { preloadFightLoader } from "../feedback/fight-loader";
import { useThemeStyles } from "../../theme/theme";
import { fonts as f, type ThemeColors } from "../../theme/tokens";

export { preloadFightLoader as preloadChoiceLoader };

export default function ChoiceLoader() {
  const [s] = useThemeStyles(createStyles);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Two doodle characters playfully fighting while your options are considered"
      accessibilityLiveRegion="polite"
      style={s.container}
    >
      <FightLoader decorative style={s.sticker} />
      <Text style={s.title}>A tiny showdown…</Text>
      <Text style={s.body}>
        Two little fighters are battling over your answer.
      </Text>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
