import { useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput } from "react-native";
import { randomUUID } from "expo-crypto";
import { router } from "expo-router";
import { toast } from "sonner-native";
import ProfilePage from "../../../components/profile/profile-page";
import OptionsForm, {
  type DecisionOption,
} from "../../../components/decision-card/options-form";
import { listRequest } from "../../../lib/choice-lists";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";

export default function NewChoiceList() {
  const [s, c] = useThemeStyles(createStyles);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<DecisionOption[]>([
    { id: 0, value: "" },
    { id: 1, value: "" },
    { id: 2, value: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(3);
  const request = useRef({ signature: "", id: "" });
  const saving = useRef(false);

  async function save() {
    if (saving.current) return;
    const values = options.map((option) => option.value.trim());
    if (!title.trim() || values.some((value) => !value)) {
      toast.error("Add a list name and fill in each option.");
      return;
    }
    if (
      new Set(values.map((value) => value.toLowerCase())).size !== values.length
    ) {
      toast.error("Give each option a different name.");
      return;
    }
    const signature = JSON.stringify([title.trim(), values]);
    if (request.current.signature !== signature)
      request.current = { signature, id: randomUUID() };
    saving.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      const list = await listRequest<{ id: string }>("", {
        id: request.current.id,
        title: title.trim(),
        options: values,
      });
      router.replace({
        pathname: "/choice-lists/[id]",
        params: { id: list.id },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t save your list.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <ProfilePage
      backTo="/lists"
      backLabel="Back to Choice Lists"
      title="New Choice List"
    >
      <Text style={s.body}>
        Add 3–20 options. Each pick removes one, so every option gets its turn.
      </Text>
      <TextInput
        accessibilityLabel="Choice List name"
        placeholder="Restaurants to try"
        placeholderTextColor={c.muted}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
        editable={!busy}
        returnKeyType="default"
        submitBehavior="submit"
        onSubmitEditing={Keyboard.dismiss}
        style={s.titleInput}
        underlineColorAndroid="transparent"
      />
      <OptionsForm
        options={options}
        minOptions={3}
        maxOptions={20}
        caption={`Your options · ${options.length}/20`}
        submitLabel={busy ? "Saving your list…" : "Save my Choice List ↗"}
        onChange={(id, value) =>
          setOptions((current) =>
            current.map((option) =>
              option.id === id ? { ...option, value } : option,
            ),
          )
        }
        onRemove={(id) =>
          setOptions((current) => current.filter((option) => option.id !== id))
        }
        onAdd={() =>
          setOptions((current) =>
            current.length < 20
              ? [...current, { id: nextId.current++, value: "" }]
              : current,
          )
        }
        onSubmit={save}
      />
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      color: c.muted,
      lineHeight: 24,
    },
    titleInput: {
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
