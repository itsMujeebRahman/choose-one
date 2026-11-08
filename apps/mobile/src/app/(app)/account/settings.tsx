import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import ProfilePage from "../../../components/profile/profile-page";
import { useTheme, useThemeStyles } from "../../../theme/theme";
import { fonts, type ThemeColors } from "../../../theme/tokens";

export default function SettingsScreen() {
  const [s, c] = useThemeStyles(createStyles);
  const { setMode, isDark } = useTheme();

  return (
    <ProfilePage title="Settings">
      <View style={s.row}>
        <View style={s.icon}>
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={c.ink}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            accessible={false}
          >
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </Svg>
        </View>
        <Text style={s.label}>Enable dark mode</Text>
        <Switch
          accessibilityLabel="Enable dark mode"
          value={isDark}
          onValueChange={(enabled) => setMode(enabled ? "dark" : "light")}
          trackColor={{ false: c.border, true: c.peachLight }}
          thumbColor={isDark ? c.ink : c.surface}
        />
      </View>
      <View style={s.links}>
        {[
          {
            title: "About us",
            href: "/account/about-us" as const,
            path: "M12 8h.01M11 12h1v4m9-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
          },
          {
            title: "Terms and conditions",
            href: "/account/terms" as const,
            path: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6",
          },
        ].map((item) => (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [s.row, pressed && { opacity: 0.65 }]}
          >
            <View style={s.icon}>
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={c.ink}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                accessible={false}
              >
                <Path d={item.path} />
              </Svg>
            </View>
            <Text style={s.label}>{item.title}</Text>
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke={c.muted}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              accessible={false}
            >
              <Path d="m9 5 7 7-7 7" />
            </Svg>
          </Pressable>
        ))}
      </View>
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    links: { gap: 12 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.surface,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: c.border,
      gap: 16,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.peachLight,
      alignItems: "center",
      justifyContent: "center",
    },
    label: { flex: 1, fontFamily: fonts.medium, fontSize: 17, color: c.ink },
  });
