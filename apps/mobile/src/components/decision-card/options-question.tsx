import { StyleSheet, Text, View } from "react-native";
import DecisionButton from "./decision-button";
import { colors as c, fonts as f } from "../../theme/tokens";

export default function OptionsQuestion({
  onContinue,
  onCancel,
}: {
  onContinue: () => void;
  onCancel: () => void;
}) {
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
const s = StyleSheet.create({
  container: { marginTop: 24, gap: 16 },
  title: { fontFamily: f.medium, fontSize: 23, lineHeight: 29, color: c.ink },
  body: { fontFamily: f.regular, color: c.muted, fontSize: 15, lineHeight: 23 },
});
