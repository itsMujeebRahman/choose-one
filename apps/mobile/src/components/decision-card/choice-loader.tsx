import { StyleSheet, Text, View } from "react-native";
import ScientistsLoader, {
  preloadScientistsLoader,
} from "../feedback/scientists-loader";
import { useThemeStyles } from "../../theme/theme";
import { fonts as f, type ThemeColors } from "../../theme/tokens";

export { preloadScientistsLoader as preloadChoiceLoader };

export default function ChoiceLoader() {
  const [s] = useThemeStyles(createStyles);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Three doodle potato scientists discussing your options in a lab"
      accessibilityLiveRegion="polite"
      style={s.container}
    >
      <ScientistsLoader decorative style={s.sticker} />
      <Text style={s.title}>The potato scientists are on it…</Text>
      <Text style={s.body}>
        They’re comparing your options to pick the finest one.
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
