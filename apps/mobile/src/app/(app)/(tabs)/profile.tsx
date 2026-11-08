import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import ProfileHeader from "../../../components/profile/profile-header";
import ProfileSection from "../../../components/profile/profile-section";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { endSession, useAppSession } from "../../../lib/session";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [s, c] = useThemeStyles(createStyles);
  const { data: session } = useAppSession();

  if (!session) return null;

  function signOut() {
    // The root logout gate owns progress, confirmation, and retry UI.
    void endSession().catch(() => {});
  }

  if (session.user.isAnonymous) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={s.page}>
        <ScrollView
          contentContainerStyle={[
            s.content,
            { paddingBottom: Math.max(insets.bottom, 16) + 100 },
          ]}
        >
          <Text style={s.title}>Your profile.</Text>
          <View style={s.guestCard}>
            <View style={s.guestBadge}>
              <Text style={s.guestBadgeText}>GUEST</Text>
            </View>
            <Text style={s.guestTitle}>{session.user.name}</Text>
            <Text style={s.guestSubtitle}>
              You’re browsing as a guest. Sign in to keep your decision history,
              build Choice Lists, and sync your profile across devices.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              onPress={() => router.push("/auth")}
              style={({ pressed }) => [
                s.signInButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={s.signInButtonText}>Sign in ↗</Text>
            </Pressable>
          </View>
          <View style={s.sections}>
            <ProfileSection
              title="Settings"
              onPress={() => router.push("/account/settings")}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={signOut}

            style={({ pressed }) => [
              s.button,
              pressed && { opacity: 0.65 },
            ]}
          >
            <View style={s.logoutContent}>
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
                  <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5M21 12H9" />
                </Svg>
                <Text style={s.buttonText}>Leave guest mode</Text>
              </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.page}>
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 100 },
        ]}
      >
        <Text style={s.title}>Your profile.</Text>
        <ProfileHeader
          name={session.user.name}
          email={session.user.email}
          image={session.user.image}
        />
        <View style={s.sections}>
          <ProfileSection
            title="Profile"
            onPress={() => router.push("/account/profile")}
          />
          <ProfileSection
            title="History"
            onPress={() => router.push("/account/history")}
          />
          <ProfileSection
            title="Settings"
            onPress={() => router.push("/account/settings")}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={signOut}

          style={({ pressed }) => [
            s.button,
            pressed && { opacity: 0.65 },
          ]}
        >
          <View style={s.logoutContent}>
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
                <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5M21 12H9" />
              </Svg>
              <Text style={s.buttonText}>Log out</Text>
            </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.background },
    content: {
      padding: 24,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
    },
    title: {
      fontFamily: f.regular,
      fontSize: 38,
      letterSpacing: -1.5,
      color: c.ink,
      marginBottom: 28,
    },
    sections: { gap: 12, marginTop: 28 },
    guestCard: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 28,
      gap: 12,
    },
    guestBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: c.surface,
    },
    guestBadgeText: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.2,
      color: c.muted,
    },
    guestTitle: {
      fontFamily: f.medium,
      fontSize: 24,
      lineHeight: 30,
      color: c.ink,
      letterSpacing: -0.5,
    },
    guestSubtitle: {
      fontFamily: f.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
    },
    signInButton: {
      marginTop: 8,
      backgroundColor: c.ink,
      borderRadius: 999,
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    signInButtonText: {
      fontFamily: f.medium,
      fontSize: 16,
      color: c.surface,
    },
    button: {
      backgroundColor: c.peachLight,
      borderRadius: 999,
      minHeight: 56,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },
    logoutContent: { flexDirection: "row", alignItems: "center", gap: 10 },
    buttonText: { fontFamily: f.medium, color: c.ink, fontSize: 15 },
  });
