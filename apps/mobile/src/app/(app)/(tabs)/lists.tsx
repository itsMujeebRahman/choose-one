import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import Svg, { Path } from "react-native-svg";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";
import ChoiceCard from "../../../components/choice-card";
import DecisionButton from "../../../components/decision-card/decision-button";
import { timeAgo } from "../../../lib/date";
import { listRequest, type ChoiceList } from "../../../lib/choice-lists";
import { colors as c, fonts as f } from "../../../theme/tokens";
export default function ListsScreen() {
  const insets = useSafeAreaInsets();
  const [lists, setLists] = useState<ChoiceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setLists(await listRequest<ChoiceList[]>());
    } catch (error) {
      setFailed(true);
      toast.error(
        error instanceof Error ? error.message : "Couldn’t load your lists.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const active = lists.filter((l) => l.pickCount < l.optionCount);
  const completed = lists.filter((l) => l.pickCount === l.optionCount);
  function card(list: ChoiceList) {
    return (
      <ChoiceCard
        key={list.id}
        title={list.title}
        meta={`${list.optionCount} options · ${list.pickCount} picked`}
        date={timeAgo(list.updatedAt)}
        result={list.latestResult}
        emptyLabel="No pick yet"
        onPress={() =>
          router.push({
            pathname: "/choice-lists/[id]",
            params: { id: list.id },
          })
        }
      />
    );
  }
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.page}>
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 190 },
        ]}
      >
        <Text style={s.title}>Choice Lists</Text>
        <Text style={s.body}>
          A fresh pick, every time. Keep your favourites together and try them
          all.
        </Text>
        {loading ? (
          <ActivityIndicator color={c.ink} />
        ) : failed ? (
          <DecisionButton label="Try again" secondary onPress={load} />
        ) : (
          <>
            <Text style={s.name}>In progress</Text>
            <View style={s.cards}>
              {active.map(card)}
              {!active.length && (
                <Text style={s.body}>
                  No active lists yet. Create one to start exploring.
                </Text>
              )}
            </View>
            {!!completed.length && (
              <>
                <Text style={s.name}>Completed</Text>
                <View style={s.cards}>{completed.map(card)}</View>
              </>
            )}
          </>
        )}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a new choice list"
        onPress={() => router.push("/choice-lists/new")}
        style={({ pressed }) => [
          s.fab,
          {
            right: 24,
            bottom: Math.max(insets.bottom, 16) + 100,
          },
          pressed && { opacity: 0.75 },
        ]}
      >
        <Svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke={c.surface}
          strokeWidth={2}
          strokeLinecap="round"
          accessible={false}
        >
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      </Pressable>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background },
  content: {
    padding: 24,
    gap: 20,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontFamily: f.regular,
    fontSize: 38,
    color: c.ink,
    letterSpacing: -1.5,
  },
  name: { fontFamily: f.medium, fontSize: 22, color: c.ink },
  body: { fontFamily: f.regular, fontSize: 16, lineHeight: 24, color: c.muted },
  cards: { gap: 12 },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: c.ink,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
