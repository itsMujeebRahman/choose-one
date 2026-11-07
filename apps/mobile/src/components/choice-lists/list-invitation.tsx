import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { toast } from "sonner-native";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";
import { useAppSession } from "../../lib/session";

export default function ListInvitation() {
  const [s] = useThemeStyles(createStyles);
  const { data: session } = useAppSession();
  const isGuest = Boolean(session?.user?.isAnonymous);

  function handlePress() {
    if (isGuest) {
      toast.info("Sign in to create your own Choice Lists.");
      router.push("/auth");
      return;
    }
    router.push("/choice-lists/new");
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create a Choice List"
      accessibilityHint="Opens the create choice list page"
      onPress={handlePress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.75 }]}
    >
      <View style={s.topRow}>
        <Text style={s.label}>CHOICE LISTS</Text>
        <Text style={s.arrow} accessible={false}>
          ↗
        </Text>
      </View>
      <Text style={s.title}>Let the app pick at random.</Text>
      <Text style={s.body}>
        Save 3–20 options in a list. Each time, the app randomly picks one for
        you — no repeats.
      </Text>
      <View style={s.cta}>
        <Text style={s.ctaLabel}>Create a Choice List</Text>
      </View>
    </Pressable>
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
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    label: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.3,
      color: c.muted,
    },
    arrow: { fontFamily: f.regular, fontSize: 22, color: c.ink },
    title: { fontFamily: f.regular, fontSize: 30, color: c.ink },
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
    cta: {
      minHeight: 52,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 999,
      backgroundColor: c.ink,
      alignItems: "center",
      justifyContent: "center",
    },
    ctaLabel: { fontFamily: f.medium, fontSize: 15, color: c.surface },
  });
