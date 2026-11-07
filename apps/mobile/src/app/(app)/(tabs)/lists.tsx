import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";
import ChoiceCard from "../../../components/choice-card";
import DecisionButton from "../../../components/decision-card/decision-button";
import FightLoader from "../../../components/feedback/fight-loader";
import { useAppSession } from "../../../lib/session";
import { timeAgo } from "../../../lib/date";
import {
  useChoiceListsQuery,
  type ChoiceList,
} from "../../../services/choice-lists";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";

export default function ListsScreen() {
  const insets = useSafeAreaInsets();
  const [s, c] = useThemeStyles(createStyles);
  const { data: session } = useAppSession();
  const isGuest = Boolean(session?.user?.isAnonymous);
  const {
    data: lists = [],
    isLoading: loading,
    isError: failed,
    refetch,
  } = useChoiceListsQuery();

  useFocusEffect(
    useCallback(() => {
      if (!isGuest) void refetch();
    }, [isGuest, refetch]),
  );

  function handleCreate() {
    if (isGuest) {
      toast.info("Sign in to create your own Choice Lists.");
      router.push("/auth");
      return;
    }
    router.push("/choice-lists/new");
  }

  const active = lists.filter((l) => l.pickCount < l.optionCount);
  const completed = lists.filter((l) => l.pickCount === l.optionCount);
  function card(list: ChoiceList) {
    const remaining = list.optionCount - list.pickCount;
    return (
      <ChoiceCard
        key={list.id}
        title={list.title}
        meta={
          remaining === 0
            ? `All ${list.optionCount} chosen - complete`
            : `${list.pickCount} of ${list.optionCount} chosen - ${remaining} left`
        }
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
          { paddingBottom: Math.max(insets.bottom, 16) + 112 },
        ]}
      >
        <View style={s.headerRow}>
          <Text style={s.title}>Choice Lists</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a new choice list"
            onPress={handleCreate}
            style={({ pressed }) => [
              s.createButton,
              pressed && { opacity: 0.75 },
            ]}
          >
            <Svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke={c.surface}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              accessible={false}
            >
              <Path d="M12 5v14M5 12h14" />
            </Svg>
            <Text style={s.createText}>Create</Text>
          </Pressable>
        </View>
        <Text style={s.body}>
          A fresh pick, every time. Keep your favourites together and try them
          all.
        </Text>
        {isGuest ? (
          <View style={s.guestNotice}>
            <Text style={s.guestNoticeTitle}>Sign in for Choice Lists</Text>
            <Text style={s.guestNoticeBody}>
              Choice Lists are saved to your account so you can pick from them
              without repeats anytime.
            </Text>
            <DecisionButton
              label="Sign in to create lists ↗"
              onPress={() => router.push("/auth")}
            />
          </View>
        ) : loading ? (
          <FightLoader style={s.loader} />
        ) : failed ? (
          <DecisionButton
            label="Try again"
            secondary
            onPress={() => void refetch()}
          />
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
    </SafeAreaView>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.background },
    content: {
      padding: 24,
      gap: 20,
      maxWidth: 560,
      width: "100%",
      alignSelf: "center",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    title: {
      fontFamily: f.regular,
      fontSize: 38,
      color: c.ink,
      letterSpacing: -1.5,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.ink,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    createText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.surface,
    },
    name: { fontFamily: f.medium, fontSize: 22, color: c.ink },
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
    cards: { gap: 12 },
    loader: { marginVertical: 12 },
    guestNotice: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 24,
      gap: 12,
      marginTop: 8,
    },
    guestNoticeTitle: {
      fontFamily: f.medium,
      fontSize: 20,
      color: c.ink,
      letterSpacing: -0.4,
    },
    guestNoticeBody: {
      fontFamily: f.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
      marginBottom: 6,
    },
  });
