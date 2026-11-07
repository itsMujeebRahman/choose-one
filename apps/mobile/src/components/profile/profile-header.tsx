import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import Svg, { Circle, Path } from "react-native-svg";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

export type ProfileHeaderProps = {
  name: string;
  email: string;
  image?: string | null;
  onEditImage?: () => void;
  isEditingImage?: boolean;
};

export default function ProfileHeader({
  name,
  email,
  image,
  onEditImage,
  isEditingImage = false,
}: ProfileHeaderProps) {
  const [s, c] = useThemeStyles(createStyles);

  return (
    <View style={s.header}>
      <View style={s.avatarWrapper}>
        <Pressable
          accessibilityRole={onEditImage ? "button" : "none"}
          accessibilityLabel={
            onEditImage ? "Change profile photo" : "Profile avatar"
          }
          onPress={onEditImage}
          disabled={!onEditImage || isEditingImage}
          style={({ pressed }) => [
            s.avatarTouchArea,
            onEditImage && pressed && { opacity: 0.8 },
          ]}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={s.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={s.avatar}>
              <Svg
                width={32}
                height={32}
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

          {isEditingImage && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator size="small" color={c.surface} />
            </View>
          )}

          {onEditImage && (
            <View style={s.editBadge} pointerEvents="none">
              <Svg
                width={13}
                height={13}
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
          )}
        </Pressable>
      </View>
      <View style={s.identity}>
        <Text style={s.name}>{name}</Text>
        <Text selectable style={s.email}>
          {email}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      backgroundColor: c.peachLight,
      borderRadius: 28,
      padding: 20,
    },
    avatarWrapper: {
      position: "relative",
    },
    avatarTouchArea: {
      position: "relative",
      width: 68,
      height: 68,
      borderRadius: 34,
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: c.lavender,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarImage: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: c.lavender,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      borderRadius: 34,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    editBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.ink,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2.5,
      borderColor: c.peachLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 3,
    },
    identity: { flex: 1, gap: 4 },
    name: { fontFamily: f.medium, fontSize: 24, color: c.ink },
    email: { fontFamily: f.regular, fontSize: 14, color: c.muted },
  });
