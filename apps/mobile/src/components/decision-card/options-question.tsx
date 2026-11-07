import { StyleSheet, Text, View } from "react-native";
import DecisionButton from "./decision-button";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

export default function OptionsQuestion({
  onContinue,
  onCancel,
}: {
  onContinue: () => void;
  onCancel: () => void;
}) {
  const [s] = useThemeStyles(createStyles);
  return (
    <View style={s.container}>
      <Text style={s.title}>
        Do you have any options for me to choose from?
      </Text>
      <Text style={s.body}>
        Give me between 2 and 10 possibilities, and I’ll pick one for you.
      </Text>
      <DecisionButton label="Yes, let me add them ↗" onPress={onContinue} />
      <DecisionButton label="Maybe later" secondary onPress={onCancel} />
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { marginTop: 24, gap: 16 },
    title: {
      fontFamily: f.medium,
      fontSize: 23,
      lineHeight: 29,
      color: c.ink,
    },
    body: {
      fontFamily: f.regular,
      color: c.muted,
      fontSize: 15,
      lineHeight: 23,
    },
  });
