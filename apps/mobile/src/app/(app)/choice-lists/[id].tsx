import ChoiceLoader, {
  preloadChoiceLoader,
} from "../../../components/decision-card/choice-loader";
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { randomUUID } from "expo-crypto";
import { toast } from "sonner-native";
import ProfilePage from "../../../components/profile/profile-page";
import DecisionButton from "../../../components/decision-card/decision-button";
import FightLoader from "../../../components/feedback/fight-loader";
import { listRequest, type ListDetail } from "../../../lib/choice-lists";
import { fullDate } from "../../../lib/date";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";
export default function ChoiceListScreen() {
  const [s] = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const request = useRef<string | null>(null);
  const picking = useRef(false);
  useEffect(() => {
    void preloadChoiceLoader();
  }, []);
  const load = useCallback(async () => {
    try {
      setList(await listRequest<ListDetail>(`/${id}`));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t load your list.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  async function pick() {
    if (picking.current) return;
    picking.current = true;
    setBusy(true);
    request.current ??= randomUUID();
    try {
      const [outcome] = await Promise.all([
        listRequest<{ label: string }>(`/${id}/pick`, {
          requestId: request.current,
        }).then(
          (result) => ({ result, error: null }),
          (error) => ({ result: null, error }),
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 10000)),
      ]);
      if (outcome.error) throw outcome.error;
      const result = outcome.result!;
      request.current = null;
      toast.success(`Your next choice: ${result.label}`);
      await load();
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
  return (
    <ProfilePage
      backTo="/lists"
      backLabel="Back to Choice Lists"
      title={list?.title ?? "Choice List"}
    >
      {loading ? (
        <FightLoader />
      ) : !list ? (
        <DecisionButton label="Try again" onPress={load} />
      ) : (
        <>
          <Text style={s.body}>
            {list.pickCount} of {list.optionCount} chosen · {remaining.length}{" "}
            left to try
          </Text>
          {!busy && latest && (
            <View style={s.answer}>
              <Text style={s.body}>YOUR LATEST PICK</Text>
              <Text style={s.title}>{latest.label}</Text>
              <Text style={s.body}>
                Pick {latest.selectedOrder} · {fullDate(latest.selectedAt)}
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
