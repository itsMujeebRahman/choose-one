import { Pressable, StyleSheet, Text, View } from "react-native";
import FightLoader from "./fight-loader";
import { useThemeStyles } from "../../theme/theme";
import { fonts, type ThemeColors } from "../../theme/tokens";

export default function SessionStatus({ retry }: { retry?: () => void }) {
  const [s] = useThemeStyles(createStyles);
  return (
    <View style={s.page}>
      {retry ? (
        <Pressable accessibilityRole="button" onPress={retry} style={s.button}>
          <Text style={s.buttonText}>Try again</Text>
        </Pressable>
      ) : (
        <FightLoader style={s.loader} />
      )}
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c.background,
      padding: 24,
      gap: 20,
    },
    loader: { width: "100%", maxWidth: 280 },
    button: {
      backgroundColor: c.ink,
      borderRadius: 999,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    buttonText: {
      fontFamily: fonts.medium,
      color: c.surface,
      fontSize: 15,
    },
  });
