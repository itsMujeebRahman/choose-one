import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fonts as f, type ThemeColors } from "../theme/tokens";
import { useThemeStyles } from "../theme/theme";

export type ConfirmModalProps = {
  visible: boolean;
  heading: string;
  bodyText: string;
  confirmText?: string;
  confirmColor?: string;
  confirmTextColor?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  cancelText?: string;
  cancelColor?: string;
  cancelTextColor?: string;
  onCancel: () => void;
  onClose?: () => void;
};

export default function ConfirmModal({
  visible,
  heading,
  bodyText,
  confirmText = "Confirm",
  confirmColor,
  confirmTextColor,
  onConfirm,
  loading = false,
  cancelText = "Cancel",
  cancelColor,
  cancelTextColor,
  onCancel,
  onClose,
}: ConfirmModalProps) {
  const [s, c] = useThemeStyles(createStyles);
  const handleDismiss = onClose ?? onCancel;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={s.overlay}>
        <Pressable
          style={s.backdrop}
          onPress={loading ? undefined : handleDismiss}
          accessible={false}
        />
        <View style={s.card} accessibilityRole="alert">
          <Text style={s.heading}>{heading}</Text>
          <Text style={s.bodyText}>{bodyText}</Text>

          <View style={s.buttonRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                s.button,
                s.cancelButton,
                cancelColor ? { backgroundColor: cancelColor } : null,
                (pressed || loading) && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  s.cancelButtonText,
                  cancelTextColor ? { color: cancelTextColor } : null,
                ]}
              >
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                s.button,
                s.confirmButton,
                confirmColor ? { backgroundColor: confirmColor } : null,
                (pressed || loading) && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color={confirmTextColor ?? c.surface}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    s.confirmButtonText,
                    confirmTextColor ? { color: confirmTextColor } : null,
                  ]}
                >
                  {confirmText}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
    },
    card: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: c.surface,
      borderRadius: 28,
      padding: 24,
      gap: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    heading: {
      fontFamily: f.medium,
      fontSize: 20,
      lineHeight: 26,
      color: c.ink,
      letterSpacing: -0.4,
    },
    bodyText: {
      fontFamily: f.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
    },
    buttonRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 8,
    },
    button: {
      minHeight: 44,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 90,
    },
    cancelButton: {
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
    },
    cancelButtonText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.ink,
    },
    confirmButton: {
      backgroundColor: c.ink,
    },
    confirmButtonText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.surface,
    },
  });
