import { Pressable, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/tokens";

export default function EditProblemButton({
  onPress,
  editing = false,
}: {
  onPress: () => void;
  editing?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={editing ? "Save problem name" : "Edit problem name"}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}
    >
      <Svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessible={false}
      >
        <Path
          d={
            editing
              ? "m5 12 4 4L19 6"
              : "m16 3 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"
          }
        />
      </Svg>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
