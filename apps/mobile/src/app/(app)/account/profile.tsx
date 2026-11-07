import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";
import Svg, { Circle, Path } from "react-native-svg";
import FightLoader from "../../../components/feedback/fight-loader";
import ProfilePage from "../../../components/profile/profile-page";
import { useAppSession } from "../../../lib/session";
import { useUpdateProfileMutation } from "../../../services/profile";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useTheme, useThemeStyles } from "../../../theme/theme";

export default function AccountProfileScreen() {
  const { isDark } = useTheme();
  const [s, c] = useThemeStyles(createStyles);
  const { data: session, refetch } = useAppSession();
  const updateProfileMutation = useUpdateProfileMutation();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(session?.user?.name ?? "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  if (!session) return null;
  if (session.user.isAnonymous) return <Redirect href="/profile" />;

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

  const handleRemoveImage = async () => {
    if (isUploadingImage) return;
    try {
      setIsUploadingImage(true);
      await updateProfileMutation.mutateAsync({ image: null });
      await refetch();
      toast.success("Profile picture removed.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn’t remove profile picture.";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const startEditName = () => {
    setNameInput(session.user.name);
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setNameInput(session.user.name);
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Please enter a name.");
      return;
    }
    if (trimmed === session.user.name) {
      setIsEditingName(false);
      return;
    }
    if (trimmed.length > 100) {
      toast.error("Name must be 100 characters or fewer.");
      return;
    }

    try {
      setIsSavingName(true);
      await updateProfileMutation.mutateAsync({ name: trimmed });
      await refetch();
      setIsEditingName(false);
      toast.success("Name updated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn’t update your name.";
      toast.error(message);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <ProfilePage title="Profile">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.wrapper}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered profile photo with absolute edit pen icon */}
          <View style={s.photoSection}>
            <View style={s.avatarWrapper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change profile picture"
                onPress={handlePickImage}
                disabled={isUploadingImage}
                style={({ pressed }) => [
                  s.avatarTouchArea,
                  pressed && { opacity: 0.8 },
                ]}
              >
                {session.user.image ? (
                  <Image
                    source={{ uri: session.user.image }}
                    style={s.avatarImage}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={s.avatarFallback}>
                    <Svg
                      width={44}
                      height={44}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.ink}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      accessible={false}
                    >
                      <Circle cx={12} cy={8} r={4} />
                      <Path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </Svg>
                  </View>
                )}

                {isUploadingImage && (
                  <View style={s.loadingOverlay}>
                    <FightLoader decorative style={s.avatarLoader} />
                  </View>
                )}

                <View style={s.editBadge} pointerEvents="none">
                  <Svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c.surface}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    accessible={false}
                  >
                    <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </Svg>
                </View>
              </Pressable>
            </View>

            {session.user.image ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleRemoveImage}
                disabled={isUploadingImage}
                style={({ pressed }) => [
                  s.removePhotoButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={s.removePhotoText}>Remove photo</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={s.card}>
            <View style={s.rowHeader}>
              <Text style={s.label}>Name</Text>
              {!isEditingName && (
                <Pressable
                  accessibilityRole="button"
                  onPress={startEditName}
                  hitSlop={8}
                  style={({ pressed }) => [
                    s.editButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={c.ink}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </Svg>
                  <Text style={s.editText}>Edit</Text>
                </Pressable>
              )}
            </View>

            {isEditingName ? (
              <View style={s.editFieldContainer}>
                <TextInput
                  accessibilityLabel="Edit name"
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  placeholder="Enter your name"
                  placeholderTextColor={c.muted}
                  keyboardAppearance={isDark ? "dark" : "light"}
                  style={s.input}
                  maxLength={100}
                  editable={!isSavingName}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <View style={s.buttonRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={cancelEditName}
                    disabled={isSavingName}
                    style={({ pressed }) => [
                      s.cancelButton,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={s.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleSaveName}
                    disabled={isSavingName || !nameInput.trim()}
                    style={({ pressed }) => [
                      s.saveButton,
                      (pressed || isSavingName || !nameInput.trim()) && {
                        opacity: 0.65,
                      },
                    ]}
                  >
                    {isSavingName ? (
                      <FightLoader decorative style={s.buttonLoader} />
                    ) : (
                      <Text style={s.saveButtonText}>Save</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Text selectable style={s.value}>
                {session.user.name}
              </Text>
            )}

            <View style={s.divider} />

            <Text style={s.label}>Email</Text>
            <Text selectable style={s.value}>
              {session.user.email}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrapper: { flex: 1 },
    scrollContent: { gap: 16 },
    photoSection: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 8,
      gap: 12,
    },
    avatarWrapper: {
      position: "relative",
    },
    avatarTouchArea: {
      position: "relative",
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    avatarFallback: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.lavender,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.lavender,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      borderRadius: 48,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarLoader: { width: 76, maxWidth: 76 },
    buttonLoader: { width: 64, maxWidth: 64 },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.ink,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2.5,
      borderColor: c.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2.5,
      elevation: 4,
    },
    removePhotoButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: c.peachLight,
    },
    removePhotoText: {
      fontFamily: f.medium,
      fontSize: 13,
      color: c.ink,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 36,
      padding: 24,
      gap: 10,
    },
    rowHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: { fontFamily: f.medium, fontSize: 13, color: c.muted },
    value: { fontFamily: f.regular, fontSize: 18, color: c.ink },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 10,
      backgroundColor: c.peachLight,
      borderRadius: 14,
    },
    editText: {
      fontFamily: f.medium,
      fontSize: 13,
      color: c.ink,
    },
    editFieldContainer: {
      gap: 12,
      marginTop: 4,
    },
    input: {
      fontFamily: f.regular,
      fontSize: 16,
      color: c.ink,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      minHeight: 48,
      paddingHorizontal: 16,
    },
    buttonRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 999,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.muted,
    },
    saveButton: {
      paddingVertical: 10,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: c.ink,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 76,
      minHeight: 40,
    },
    saveButtonText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.surface,
    },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 10 },
  });
