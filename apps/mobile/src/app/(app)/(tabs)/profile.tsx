import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ProfileHeader from "../../../components/profile/profile-header";
import ProfileSection from "../../../components/profile/profile-section";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";
import FightLoader from "../../../components/feedback/fight-loader";
import { endSession, useAppSession } from "../../../lib/session";
import { useUpdateProfileMutation } from "../../../services/profile";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [s, c] = useThemeStyles(createStyles);
  const { data: session, refetch } = useAppSession();
  const updateProfileMutation = useUpdateProfileMutation();
  const [busy, setBusy] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  if (!session) return null;

  const handlePickImage = async () => {
    if (isUploadingImage) return;
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.error(
          "Permission to access photos is needed to change your picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const dataUri = asset.base64
          ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
          : asset.uri;

        setIsUploadingImage(true);
        await updateProfileMutation.mutateAsync({ image: dataUri });
        await refetch();
        toast.success("Profile picture updated.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn’t update profile picture.";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await endSession();
      if (result.error) toast.error("Couldn’t sign out. Please try again.");
      else toast.success("You’ve signed out.");
    } catch {
      toast.error("Couldn’t connect. Please try again.");
    } finally {
      setBusy(false);
    }
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
          onEditImage={handlePickImage}
          isEditingImage={isUploadingImage}
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
          disabled={busy}
          style={({ pressed }) => [
            s.button,
            (pressed || busy) && { opacity: 0.65 },
          ]}
        >
          {busy ? (
            <FightLoader decorative style={s.buttonLoader} />
          ) : (
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
          )}
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
    button: {
      backgroundColor: c.peachLight,
      borderRadius: 999,
      minHeight: 56,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },
    buttonLoader: { width: 72, maxWidth: 72 },
    logoutContent: { flexDirection: "row", alignItems: "center", gap: 10 },
    buttonText: { fontFamily: f.medium, color: c.ink, fontSize: 15 },
  });
