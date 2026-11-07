import { StyleSheet, Text, View } from "react-native";
import { fonts, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

const samples = [
  {
    title: "A little room to breathe",
    text: "Pause for a moment. You can take the next step at your own pace.",
    colorKey: "lavender" as const,
  },
  {
    title: "One small possibility",
    text: "Sometimes a fresh perspective starts with one little choice.",
    colorKey: "yellow" as const,
  },
  {
    title: "Find your calm",
    text: "Make a little space for something that feels good today.",
    colorKey: "mint" as const,
  },
  {
    title: "A softer kind of day",
    text: "There is no need to have every answer right now.",
    colorKey: "peach" as const,
  },
  {
    title: "Try something new",
    text: "A small change can open up a whole new direction.",
    colorKey: "blue" as const,
  },
  {
    title: "You made it here",
    text: "A little progress still counts. Keep going at your own pace.",
    colorKey: "coral" as const,
  },
];

// Temporary content for checking scroll, header blur, and bottom navigation clearance.
export default function ScrollPreviewCards() {
  const [s, c] = useThemeStyles(createStyles);
  return (
    <View style={s.list}>
      {samples.map((sample, index) => (
        <View
          key={sample.title}
          style={[s.card, { backgroundColor: c[sample.colorKey] }]}
        >
          <Text style={s.number}>0{index + 1} / A LITTLE MOMENT</Text>
          <Text style={s.title}>{sample.title}</Text>
          <Text style={s.body}>{sample.text}</Text>
        </View>
      ))}
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
      marginTop: 20,
      gap: 20,
    },
    card: {
      minHeight: 200,
      borderRadius: 36,
      padding: 28,
      justifyContent: "center",
    },
    number: {
      fontFamily: fonts.medium,
      fontSize: 10,
      letterSpacing: 1.5,
      color: c.ink,
      marginBottom: 20,
    },
    title: {
      fontFamily: fonts.medium,
      fontSize: 28,
      lineHeight: 32,
      letterSpacing: -0.8,
      color: c.ink,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 23,
      color: c.ink,
      marginTop: 12,
    },
  });
