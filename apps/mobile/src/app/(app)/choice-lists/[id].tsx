import ChoiceLoader, {
  preloadChoiceLoader,
} from "../../../components/decision-card/choice-loader";
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { toast } from "sonner-native";
import ProfilePage from "../../../components/profile/profile-page";
import DecisionButton from "../../../components/decision-card/decision-button";
import {
  answerColorCount,
  getAnswerColors,
} from "../../../components/decision-card/choice-result";
import FightLoader from "../../../components/feedback/fight-loader";
import {
  useChoiceListDetailQuery,
  usePickFromChoiceListMutation,
} from "../../../services/choice-lists";
import { fullDate } from "../../../lib/date";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";

export default function ChoiceListScreen() {
  const [s, c] = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: list,
    isLoading: loading,
    refetch,
  } = useChoiceListDetailQuery(id);
  const pickMutation = usePickFromChoiceListMutation();
  const [busy, setBusy] = useState(false);
  const picking = useRef(false);

  useEffect(() => {
    void preloadChoiceLoader();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  async function pick() {
    if (picking.current) return;
    picking.current = true;
    setBusy(true);
    try {
      const [outcome] = await Promise.all([
        pickMutation
          .mutateAsync({ listId: id })
          .then((result) => ({ result, error: null }))
          .catch((error) => ({ result: null, error })),
        new Promise<void>((resolve) => setTimeout(resolve, 10000)),
      ]);
      if (outcome.error) throw outcome.error;
      const result = outcome.result!;
      toast.success(`Your next choice: ${result.label}`);
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t pick an option.",
      );
    } finally {
      picking.current = false;
      setBusy(false);
    }
  }
  const selected =
    list?.options
      .filter((o) => o.selectedOrder !== null)
      .sort((a, b) => a.selectedOrder! - b.selectedOrder!) ?? [];
  const remaining = list?.options.filter((o) => o.selectedOrder === null) ?? [];
  const latest = selected[selected.length - 1];
  const latestColor = latest
    ? getAnswerColors(c)[((latest.selectedOrder ?? 1) - 1) % answerColorCount]
    : undefined;
  return (
    <ProfilePage
      backTo="/lists"
      backLabel="Back to Choice Lists"
      title={list?.title ?? "Choice List"}
    >
      {loading ? (
        <FightLoader />
      ) : !list ? (
        <DecisionButton label="Try again" onPress={() => void refetch()} />
      ) : (
        <>
          <Text style={s.body}>
            {list.pickCount} of {list.optionCount} chosen - {remaining.length}{" "}
            left to try
          </Text>
          {!busy && latest && (
            <View style={[s.answer, { backgroundColor: latestColor }]}>
              <Text style={s.body}>YOUR LATEST PICK</Text>
              <Text style={s.title}>{latest.label}</Text>
              <Text style={s.body}>
                Pick {latest.selectedOrder} - {fullDate(latest.selectedAt)}
              </Text>
            </View>
          )}
          {busy && <ChoiceLoader />}
          {remaining.length ? (
            <>
              <DecisionButton
                label={busy ? "Choosing…" : "Choose my next option ↗"}
                disabled={busy}
                onPress={pick}
              />
              <Text style={s.body}>
                Pick again whenever you’re ready, today or another day. Previous
                picks won’t repeat.
              </Text>
            </>
          ) : (
            <View style={s.answer}>
              <Text style={s.title}>You’ve tried them all!</Text>
              <Text style={s.body}>
                Every option has had its turn. Your picks are saved below.
              </Text>
            </View>
          )}
          <Text style={s.title}>Still to try</Text>
          {remaining.map((o) => (
            <View key={o.id} style={s.row}>
              <Text style={s.body}>{o.label}</Text>
            </View>
          ))}
          {!!selected.length && <Text style={s.title}>Your picks</Text>}
          {selected.map((o) => (
            <View key={o.id} style={s.row}>
              <Text style={s.body}>
                {o.selectedOrder}. {o.label}
              </Text>
              <Text style={s.date}>{fullDate(o.selectedAt)}</Text>
            </View>
          ))}
        </>
      )}
    </ProfilePage>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
    date: { fontFamily: f.regular, fontSize: 12, color: c.muted },
    title: { fontFamily: f.medium, fontSize: 24, color: c.ink },
    answer: {
      padding: 24,
      borderRadius: 36,
      backgroundColor: c.yellow,
      gap: 12,
    },
    row: { padding: 18, borderRadius: 18, backgroundColor: c.surface, gap: 6 },
  });
