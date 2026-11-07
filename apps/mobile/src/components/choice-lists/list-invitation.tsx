import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import DecisionButton from "../decision-card/decision-button";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";
export default function ListInvitation() {
  const [s] = useThemeStyles(createStyles);
  return (
    <View style={s.card}>
      <Text style={s.label}>ONE LIST. MANY LITTLE ADVENTURES.</Text>
      <Text style={s.title}>Want to try them all?</Text>
      <Text style={s.body}>
        Save 3–20 restaurants, movies, or ideas. Pick something new each time,
        without repeats. Come back tomorrow for your next adventure.
      </Text>
      <DecisionButton
        label="Create a Choice List ↗"
        onPress={() => router.push("/choice-lists/new")}
      />
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.mint,
      borderRadius: 36,
      padding: 28,
      gap: 18,
      marginTop: 20,
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
    },
    label: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.3,
      color: c.muted,
    },
    title: { fontFamily: f.regular, fontSize: 30, color: c.ink },
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
  });
