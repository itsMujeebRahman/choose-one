import { StyleSheet, Text, View } from "react-native";
import { fonts, spacing, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

type AppTitleProps = { userName: string; appName?: string };

export default function AppTitle({
  userName,
  appName = "choose one",
}: AppTitleProps) {
  const [s] = useThemeStyles(createStyles);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.appName}>
        {appName}
        <Text style={s.dot}>.</Text>
      </Text>
      <Text style={s.userName}>{userName}</Text>
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
      color: c.ink,
    },
    dot: { color: c.sage },
    userName: {
      fontFamily: fonts.regular,
      fontSize: 18,
      lineHeight: 22,
      color: c.muted,
    },
  });
