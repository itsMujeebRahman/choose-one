import { Pressable, StyleSheet, Text } from "react-native";
import { colors as c, fonts as f } from "../../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
};
export default function DecisionButton({
  label,
  onPress,
  secondary,
  disabled,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text style={[s.label, secondary && { color: c.ink }]}>{label}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: c.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: { backgroundColor: c.surface },
  label: { fontFamily: f.medium, fontSize: 15, color: c.surface },
});
