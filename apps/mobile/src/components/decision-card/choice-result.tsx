import { StyleSheet, Text, View } from "react-native";
import DecisionButton from "./decision-button";
import { colors as c, fonts as f } from "../../theme/tokens";

export const answerColors = [
  c.yellow,
  c.lavender,
  c.mint,
  c.blue,
  c.coral,
] as const;

type Props = { answer: string; colorIndex: number; onStartNew: () => void };
export default function ChoiceResult({
  answer,
  colorIndex,
  onStartNew,
}: Props) {
  return (
    <View style={s.container}>
      <View
        style={[s.answer, { backgroundColor: answerColors[colorIndex] }]}
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
    </View>
  );
}
const s = StyleSheet.create({
  container: { marginTop: 24, gap: 12 },
  answer: {
    borderRadius: 28,
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
