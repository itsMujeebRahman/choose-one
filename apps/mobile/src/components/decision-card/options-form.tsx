import { useEffect, useRef, type ComponentRef } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import OptionInput from "./option-input";
import DecisionButton from "./decision-button";
import { fonts as f, type ThemeColors } from "../../theme/tokens";
import { useThemeStyles } from "../../theme/theme";

export type DecisionOption = { id: number; value: string };
type Props = {
  options: DecisionOption[];
  onChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
  onSubmit: () => void;
  minOptions?: number;
  maxOptions?: number;
  submitLabel?: string;
  heading?: string;
  caption?: string;
  onCancel?: () => void;
};
export default function OptionsForm({
  options,
  onChange,
  onRemove,
  onAdd,
  onSubmit,
  minOptions = 2,
  maxOptions = 10,
  submitLabel = "Choose one for me",
  heading,
  caption,
  onCancel,
}: Props) {
  const [s] = useThemeStyles(createStyles);
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
    } else if (options.length < maxOptions && options[index].value.trim()) {
      if (pendingFocus.current !== null) return;
      pendingFocus.current = index + 1;
      onAdd();
    } else if (options.length === maxOptions) {
      Keyboard.dismiss();
    }
  }
  return (
    <View style={s.form}>
      <View style={s.header}>
        {heading ? <Text style={s.heading}>{heading}</Text> : null}
        <Text style={s.caption}>
          {caption ?? `${options.length}/${maxOptions} options`}
        </Text>
      </View>
      {options.map((option, index) => (
        <OptionInput
          key={option.id}
          inputRef={(input) => {
            if (input) inputs.current.set(option.id, input);
            else inputs.current.delete(option.id);
          }}
          onNext={() => nextOption(index)}
          isLastAllowed={index === maxOptions - 1}
          number={index + 1}
          value={option.value}
          onChange={(value) => onChange(option.id, value)}
          onRemove={
            options.length > minOptions ? () => onRemove(option.id) : undefined
          }
        />
      ))}
      {options.length < maxOptions && (
        <DecisionButton
          label="+ Add another option"
          secondary
          onPress={onAdd}
        />
      )}
      <View style={{ marginTop: 8 }}>
        <DecisionButton label={submitLabel} onPress={onSubmit} />
      </View>
      {onCancel && (
        <DecisionButton label="Not yet" secondary onPress={onCancel} />
      )}
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    form: { gap: 10, marginTop: 24 },
    header: { gap: 4, marginBottom: 4 },
    heading: {
      fontFamily: f.medium,
      fontSize: 18,
      lineHeight: 24,
      color: c.ink,
    },
    caption: {
      fontFamily: f.medium,
      fontSize: 12,
      color: c.muted,
    },
  });
