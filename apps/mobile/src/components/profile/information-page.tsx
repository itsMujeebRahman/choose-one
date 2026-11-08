import { StyleSheet, Text, View } from "react-native";
import ProfilePage from "./profile-page";
import { useThemeStyles } from "../../theme/theme";
import { fonts, type ThemeColors } from "../../theme/tokens";

export default function InformationPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: readonly { title: string; body: string }[];
}) {
  const [s] = useThemeStyles(createStyles);
  return (
    <ProfilePage
      title={title}
      backTo="/account/settings"
      backLabel="Back to settings"
    >
      <View style={s.intro}>
        <Text style={s.brand}>CHOOSE ONE</Text>
        <Text style={s.introText}>{intro}</Text>
      </View>
      <View style={s.sections}>
        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text accessibilityRole="header" style={s.title}>
              {section.title}
            </Text>
            <Text selectable style={s.body}>
              {section.body}
            </Text>
          </View>
        ))}
      </View>
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    intro: {
      padding: 24,
      borderRadius: 28,
      gap: 12,
      backgroundColor: c.peachLight,
    },
    brand: {
      fontFamily: fonts.medium,
      fontSize: 11,
      letterSpacing: 2,
      color: c.muted,
    },
    introText: {
      fontFamily: fonts.regular,
      fontSize: 22,
      lineHeight: 30,
      color: c.ink,
    },
    sections: {
      backgroundColor: c.surface,
      padding: 24,
      borderRadius: 28,
      gap: 24,
    },
    section: { gap: 8 },
    title: {
      fontFamily: fonts.medium,
      fontSize: 18,
      lineHeight: 25,
      color: c.ink,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 23,
      color: c.muted,
    },
  });
