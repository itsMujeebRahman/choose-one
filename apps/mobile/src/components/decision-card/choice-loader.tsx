import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors as c, fonts as f } from "../../theme/tokens";

export default function ChoiceLoader() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Choosing one of your options"
      accessibilityLiveRegion="polite"
      style={s.container}
    >
      <View style={s.orb}>
        <ActivityIndicator size="large" color={c.ink} />
      </View>
      <Text style={s.title}>A little moment…</Text>
      <Text style={s.body}>Let’s untangle those possibilities.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  container: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: c.lavender,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontFamily: f.medium, fontSize: 22, color: c.ink },
  body: {
    fontFamily: f.regular,
    fontSize: 14,
    color: c.muted,
    textAlign: "center",
  },
});
