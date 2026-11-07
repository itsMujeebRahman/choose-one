import { router } from "expo-router";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

const illustration = require("../../../assets/doodleVideo/fern-transparent.webp");

export default function GuestPromoCard({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const [s, c] = useThemeStyles(createStyles);
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={s.card}
    >
      <View style={s.topRow}>
        <View style={s.badge}>
          <Text style={s.badgeText}>GUEST ACCOUNT</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss sign in card"
          hitSlop={12}
          onPress={onDismiss}
          style={({ pressed }) => [s.close, pressed && { opacity: 0.6 }]}
        >
          <Svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={c.ink}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            accessible={false}
          >
            <Path d="M18 6 6 18M6 6l12 12" />
          </Svg>
        </Pressable>
      </View>
      <View style={s.illustrationRow}>
        <Image
          source={illustration}
          contentFit="contain"
          autoplay
          cachePolicy="memory-disk"
          recyclingKey="guest-promo-illustration"
          accessibilityRole="image"
          accessibilityLabel="A doodle gardener caring for a plant"
          style={s.illustration}
        />
      </View>
      <Text style={s.title}>Save your choices & lists.</Text>
      <Text style={s.body}>
        Sign in with Google or Apple to keep your decision history, build Choice
        Lists, and sync across your devices.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        onPress={() => router.push("/auth")}
        style={({ pressed }) => [s.cta, pressed && { opacity: 0.8 }]}
      >
        <Text style={s.ctaText}>Sign in ↗</Text>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.lavender,
      borderRadius: 36,
      padding: 24,
      gap: 14,
      marginTop: 20,
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    illustrationRow: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 2,
    },
    illustration: {
      width: 140,
      aspectRatio: 16 / 9,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: c.surface,
    },
    badgeText: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.2,
      color: c.muted,
    },
    close: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: f.regular,
      fontSize: 26,
      lineHeight: 32,
      letterSpacing: -0.6,
      color: c.ink,
    },
    body: {
      fontFamily: f.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
    },
    cta: {
      minHeight: 48,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: c.ink,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
    },
    ctaText: {
      fontFamily: f.medium,
      fontSize: 15,
      color: c.surface,
    },
  });

