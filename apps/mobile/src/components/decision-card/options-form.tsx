import { useEffect, useRef, type ComponentRef } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import OptionInput from "./option-input";
import DecisionButton from "./decision-button";
import { colors as c, fonts as f } from "../../theme/tokens";

export type DecisionOption = { id: number; value: string };
type Props = {
  options: DecisionOption[];
  onChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
  onChoose: () => void;
};
export default function OptionsForm({
  options,
  onChange,
  onRemove,
  onAdd,
  onChoose,
}: Props) {
  const inputs = useRef(new Map<number, ComponentRef<typeof TextInput>>());
  const pendingFocus = useRef<number | null>(null);
  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null || !options[index]) return;
    inputs.current.get(options[index].id)?.focus();
    pendingFocus.current = null;
  }, [options]);
  function nextOption(index: number) {
    const next = options[index + 1];
    if (next) {
      inputs.current.get(next.id)?.focus();
    } else if (options.length < 10 && options[index].value.trim()) {
      if (pendingFocus.current !== null) return;
      pendingFocus.current = index + 1;
      onAdd();
    } else if (options.length === 10) {
      Keyboard.dismiss();
    }
  }
  return (
    <View style={s.form}>
      <Text style={s.caption}>Your options · {options.length}/10</Text>
      {options.map((option, index) => (
        <OptionInput
          key={option.id}
          inputRef={(input) => {
            if (input) inputs.current.set(option.id, input);
            else inputs.current.delete(option.id);
          }}
          onNext={() => nextOption(index)}
          isLastAllowed={index === 9}
          number={index + 1}
          value={option.value}
          onChange={(value) => onChange(option.id, value)}
          onRemove={options.length > 2 ? () => onRemove(option.id) : undefined}
        />
      ))}
      {options.length < 10 && (
        <DecisionButton
          label="+ Add another option"
          secondary
          onPress={onAdd}
        />
      )}
      <View style={{ marginTop: 8 }}>
        <DecisionButton label="Choose one for me ↗" onPress={onChoose} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  form: { gap: 10, marginTop: 24 },
  caption: {
    fontFamily: f.medium,
    fontSize: 12,
    color: c.muted,
    marginBottom: 4,
  },
});
