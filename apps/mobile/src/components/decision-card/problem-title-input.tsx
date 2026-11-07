import FlippingPlaceholder from "./flipping-placeholder";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useTheme, useThemeStyles } from "../../theme/theme";
import DecisionButton from "./decision-button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
};
export default function ProblemTitleInput({
  value,
  onChange,
  onContinue,
}: Props) {
  const [s, c] = useThemeStyles(createStyles);
  const { isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.container}>
      <Text style={s.label}>Give your problem a name</Text>
      <View>
        <TextInput
          accessibilityLabel="Problem name"
          placeholderTextColor={c.muted}
          keyboardAppearance={isDark ? "dark" : "light"}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={100}
          style={s.input}
          returnKeyType="next"
          onSubmitEditing={onContinue}
          underlineColorAndroid="transparent"
        />
        {!value && !focused && <FlippingPlaceholder />}
      </View>
      <DecisionButton label="Let’s figure it out ↗" onPress={onContinue} />
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 16, marginTop: 24 },
    label: { fontFamily: f.medium, fontSize: 13, color: c.muted },
    input: {
      minHeight: 58,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: c.surface,
      color: c.ink,
      fontFamily: f.regular,
      fontSize: 15,
    },
  });
