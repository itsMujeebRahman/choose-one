import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ComponentRef, Ref } from "react";
import { colors as c, fonts as f } from "../../theme/tokens";

type Props = {
  number: number;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
  onNext: () => void;
  isLastAllowed: boolean;
};
export default function OptionInput({
  number,
  value,
  onChange,
  onRemove,
  inputRef,
  onNext,
  isLastAllowed,
}: Props) {
  return (
    <View style={s.row}>
      <Text style={s.number}>{String(number).padStart(2, "0")}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={`Option ${number}`}
        placeholder={`Option ${number}`}
        placeholderTextColor={c.muted}
        value={value}
        onChangeText={onChange}
        maxLength={120}
        style={s.input}
        autoComplete="off"
        returnKeyType="default"
        submitBehavior={isLastAllowed ? "blurAndSubmit" : "submit"}
        onSubmitEditing={onNext}
        underlineColorAndroid="transparent"
      />
      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove option ${number}`}
          hitSlop={4}
          onPress={onRemove}
          style={s.remove}
        >
          <Text style={s.cross}>×</Text>
        </Pressable>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 4,
  },
  number: {
    fontFamily: f.medium,
    color: c.sage,
    fontSize: 12,
    marginRight: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 16,
    fontFamily: f.regular,
    fontSize: 15,
    color: c.ink,
  },
  remove: {
    width: 44,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  cross: { fontSize: 24, color: c.muted },
});
