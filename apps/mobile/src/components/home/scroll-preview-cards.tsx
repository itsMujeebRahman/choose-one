import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../../theme/tokens";

const samples = [
  {
    title: "A little room to breathe",
    text: "Pause for a moment. You can take the next step at your own pace.",
    color: colors.lavender,
  },
  {
    title: "One small possibility",
    text: "Sometimes a fresh perspective starts with one little choice.",
    color: colors.yellow,
  },
  {
    title: "Find your calm",
    text: "Make a little space for something that feels good today.",
    color: colors.mint,
  },
  {
    title: "A softer kind of day",
    text: "There is no need to have every answer right now.",
    color: colors.peach,
  },
  {
    title: "Try something new",
    text: "A small change can open up a whole new direction.",
    color: colors.blue,
  },
  {
    title: "You made it here",
    text: "A little progress still counts. Keep going at your own pace.",
    color: colors.coral,
  },
];

// Temporary content for checking scroll, header blur, and bottom navigation clearance.
export default function ScrollPreviewCards() {
  return (
    <View style={styles.list}>
      {samples.map((sample, index) => (
        <View
          key={sample.title}
          style={[styles.card, { backgroundColor: sample.color }]}
        >
          <Text style={styles.number}>0{index + 1} / A LITTLE MOMENT</Text>
          <Text style={styles.title}>{sample.title}</Text>
          <Text style={styles.body}>{sample.text}</Text>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
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
    color: colors.ink,
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
    marginTop: 12,
  },
});
