import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";
import ProfilePage from "../../../components/profile/profile-page";
import { useTheme, useThemeStyles, type ThemeMode } from "../../../theme/theme";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";

type Option = {
  key: ThemeMode;
  title: string;
  subtitle: string;
};

const OPTIONS: Option[] = [
  {
    key: "system",
    title: "System default",
    subtitle: "Follows your device appearance automatically",
  },
  {
    key: "light",
    title: "Light mode",
    subtitle: "Bright, clean, and gentle pastel tones",
  },
  {
    key: "dark",
    title: "Dark mode",
    subtitle: "Soft on your eyes with warm dark accents",
  },
];

function ThemeIcon({ mode, color }: { mode: ThemeMode; color: string }) {
  if (mode === "light") {
    return (
      <Svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessible={false}
      >
        <Circle cx="12" cy="12" r="5" />
        <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </Svg>
    );
  }
  if (mode === "dark") {
    return (
      <Svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessible={false}
      >
        <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </Svg>
    );
  }
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      <Rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <Path d="M8 21h8M12 17v4" />
    </Svg>
  );
}

export default function SettingsScreen() {
  const [s, c] = useThemeStyles(createStyles);
  const { mode, setMode, isDark } = useTheme();

  return (
    <ProfilePage title="Settings">
      <View style={s.card}>
        <Text style={s.sectionEyebrow}>APPEARANCE</Text>
        <Text style={s.cardTitle}>Choose your theme</Text>
        <Text style={s.body}>
          Pick a look that feels comfortable. Your choice is saved
          automatically.
        </Text>
        <View style={s.options}>
          {OPTIONS.map((option) => {
            const isSelected = mode === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityLabel={`${option.title}: ${option.subtitle}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setMode(option.key)}
                style={({ pressed }) => [
                  s.optionRow,
                  isSelected && s.optionRowSelected,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View
                  style={[
                    s.iconWrap,
                    isSelected ? s.iconWrapSelected : s.iconWrapDefault,
                  ]}
                >
                  <ThemeIcon
                    mode={option.key}
                    color={isSelected ? c.ink : c.muted}
                  />
                </View>
                <View style={s.textContainer}>
                  <Text
                    style={[s.optionTitle, isSelected && s.optionTitleSelected]}
                  >
                    {option.title}
                  </Text>
                  <Text style={s.optionSubtitle}>{option.subtitle}</Text>
                </View>
                {isSelected && (
                  <View style={s.checkPill}>
                    <Svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.ink}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      accessible={false}
                    >
                      <Polyline points="20 6 9 17 4 12" />
                    </Svg>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={s.statusCard}>
        <Text style={s.statusTitle}>
          Currently active: {isDark ? "Dark theme" : "Light theme"}
        </Text>
        <Text style={s.statusBody}>
          {mode === "system"
            ? "Syncing with your device system appearance."
            : `Set to always use ${mode} mode.`}
        </Text>
      </View>
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 24,
      gap: 12,
    },
    sectionEyebrow: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.5,
      color: c.muted,
    },
    cardTitle: {
      fontFamily: f.medium,
      fontSize: 26,
      lineHeight: 32,
      color: c.ink,
      letterSpacing: -0.5,
    },
    body: {
      fontFamily: f.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
      marginBottom: 6,
    },
    options: {
      gap: 10,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    optionRowSelected: {
      borderColor: c.ink,
      backgroundColor: c.surface,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapDefault: {
      backgroundColor: c.subtle,
    },
    iconWrapSelected: {
      backgroundColor: c.yellow,
    },
    textContainer: {
      flex: 1,
      gap: 2,
    },
    optionTitle: {
      fontFamily: f.medium,
      fontSize: 16,
      color: c.ink,
    },
    optionTitleSelected: {
      fontFamily: f.medium,
      color: c.ink,
    },
    optionSubtitle: {
      fontFamily: f.regular,
      fontSize: 13,
      lineHeight: 18,
      color: c.muted,
    },
    checkPill: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.mint,
      alignItems: "center",
      justifyContent: "center",
    },
    statusCard: {
      backgroundColor: c.surface,
      borderRadius: 36,
      padding: 24,
      gap: 8,
    },
    statusTitle: {
      fontFamily: f.medium,
      fontSize: 17,
      color: c.ink,
    },
    statusBody: {
      fontFamily: f.regular,
      fontSize: 14,
      lineHeight: 20,
      color: c.muted,
    },
  });
