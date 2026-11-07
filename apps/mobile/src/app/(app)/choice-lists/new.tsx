import { useRef, useState, type ComponentRef } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { randomUUID } from "expo-crypto";
import { router } from "expo-router";
import { toast } from "sonner-native";
import ProfilePage from "../../../components/profile/profile-page";
import DecisionButton from "../../../components/decision-card/decision-button";
import FlippingPlaceholder from "../../../components/decision-card/flipping-placeholder";
import OptionsForm, {
  type DecisionOption,
} from "../../../components/decision-card/options-form";
import { useCreateChoiceListMutation } from "../../../services/choice-lists";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useTheme, useThemeStyles } from "../../../theme/theme";
import { useAppSession } from "../../../lib/session";

const choiceListPlaceholders = [
  "Restaurants to try",
  "Movies for movie night",
  "Weekend getaway ideas",
  "Books on my reading list",
  "Coffee shops to explore",
];

export default function NewChoiceList() {
  const [s, c] = useThemeStyles(createStyles);
  const { isDark } = useTheme();
  const { data: session } = useAppSession();
  const isGuest = Boolean(session?.user?.isAnonymous);
  const createListMutation = useCreateChoiceListMutation();
  const [title, setTitle] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [options, setOptions] = useState<DecisionOption[]>([
    { id: 0, value: "" },
    { id: 1, value: "" },
    { id: 2, value: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const titleInput = useRef<ComponentRef<typeof TextInput>>(null);
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
      const list = await createListMutation.mutateAsync({
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

  if (isGuest) {
    return (
      <ProfilePage
        backTo="/lists"
        backLabel="Back to Choice Lists"
        title="Choice Lists"
      >
        <View style={s.card}>
          <Text style={s.heading}>Sign in to create Choice Lists</Text>
          <Text style={s.caption}>
            Choice Lists stay saved to your account so you can pick from them
            anytime without repeats.
          </Text>
          <DecisionButton
            label="Sign in to get started ↗"
            onPress={() => router.push("/auth")}
          />
        </View>
      </ProfilePage>
    );
  }

  return (
    <ProfilePage
      backTo="/lists"
      backLabel="Back to Choice Lists"
      title="New Choice List"
    >
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.heading}>Give your list a name</Text>
          <Text style={s.caption}>
            Add 3–20 options. Each pick removes one, so every option gets its turn.
          </Text>
        </View>
        <View>
          <TextInput
            ref={titleInput}
            accessibilityLabel="Choice List name"
            placeholderTextColor={c.muted}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            maxLength={100}
            editable={!busy}
            keyboardAppearance={isDark ? "dark" : "light"}
            returnKeyType="default"
            submitBehavior="submit"
            onSubmitEditing={Keyboard.dismiss}
            style={s.titleInput}
            underlineColorAndroid="transparent"
          />
          {!title && !titleFocused && (
            <FlippingPlaceholder placeholders={choiceListPlaceholders} />
          )}
        </View>
        <OptionsForm
          options={options}
          heading="Enter your options"
          minOptions={3}
          maxOptions={20}
          caption={`Your options - ${options.length}/20`}
          submitLabel={busy ? "Saving your list…" : "Save my Choice List"}
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
      </View>
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 28,
      gap: 16,
    },
    header: { gap: 4, marginBottom: 4 },
    heading: {
      fontFamily: f.medium,
      fontSize: 18,
      lineHeight: 24,
      color: c.ink,
    },
    caption: {
      fontFamily: f.regular,
      fontSize: 14,
      lineHeight: 20,
      color: c.muted,
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
