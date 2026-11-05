import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../../theme/tokens";

type AppTitleProps = { userName: string; appName?: string };

export default function AppTitle({
  userName,
  appName = "choose one",
}: AppTitleProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.appName}>
        {appName}
        <Text style={styles.dot}>.</Text>
      </Text>
      <Text style={styles.userName}>{userName}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    gap: 0,
    marginBottom: spacing.lg,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  appName: {
    fontFamily: fonts.semibold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.4,
    color: colors.ink,
  },
  dot: { color: colors.sage },
  userName: {
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 22,
    color: colors.muted,
  },
});
