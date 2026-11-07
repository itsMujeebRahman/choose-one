import { StyleSheet, Text, View } from "react-native";
import { MoodGarden } from "../auth/auth-screen";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

type UpdateCardProps = { userName: string; email: string };

export default function UpdateCard({ userName, email }: UpdateCardProps) {
  const [s] = useThemeStyles(createStyles);
  return (
    <View style={s.card}>
      <Text style={s.label}>YOUR SPACE TO BEGIN</Text>
      <Text style={s.title}>
        Hello, {userName.split(" ")[0]}.{"\n"}Glad you’re here.
      </Text>
      <Text style={s.body}>
        One small choice can be a lovely place to start.
      </Text>
      <MoodGarden />
      <Text style={s.body}>You’re signed in as {email}</Text>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 28,
    },
    label: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 2,
      color: c.muted,
      marginBottom: 15,
    },
    title: {
      fontFamily: f.regular,
      fontSize: 36,
      lineHeight: 40,
      letterSpacing: -1.4,
      color: c.ink,
    },
    body: {
      fontFamily: f.regular,
      fontSize: 14,
      color: c.muted,
      lineHeight: 22,
      marginTop: 14,
    },
  });
