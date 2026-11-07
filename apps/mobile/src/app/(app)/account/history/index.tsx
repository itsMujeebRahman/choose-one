import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { toast } from "sonner-native";
import ChoiceCard from "../../../../components/choice-card";
import {
  answerColorCount,
  getAnswerColors,
} from "../../../../components/decision-card/choice-result";
import DecisionButton from "../../../../components/decision-card/decision-button";
import FightLoader from "../../../../components/feedback/fight-loader";
import ProfilePage from "../../../../components/profile/profile-page";
import { timeAgo } from "../../../../lib/date";
import { historyRequest, type HistoryItem } from "../../../../lib/history";
import { fonts as f, type ThemeColors } from "../../../../theme/tokens";
import { useThemeStyles } from "../../../../theme/theme";

export default function HistoryScreen() {
  const [s, c] = useThemeStyles(createStyles);
  const answerColors = getAnswerColors(c);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setItems(await historyRequest<HistoryItem[]>());
    } catch (error) {
      setFailed(true);
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn’t load your history. Please try again.",
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
  return (
    <ProfilePage title="History">
      {loading ? (
        <FightLoader style={s.loader} />
      ) : failed ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>We couldn’t load your history.</Text>
          <Text style={s.body}>
            Check your connection and try again in a moment.
          </Text>
          <DecisionButton label="Try again" secondary onPress={load} />
        </View>
      ) : !items.length ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>Your little decisions.</Text>
          <Text style={s.body}>
            Once you pick an option, it will show up here so you can look back
            at the choices you’ve made.
          </Text>
          <DecisionButton
            label="Make your first choice"
            onPress={() => router.replace("/")}
          />
        </View>
      ) : (
        <>
          <Text style={s.summary}>Every choice you’ve made, newest first.</Text>
          <View style={s.list}>
            {items.map((item, index) => (
              <ChoiceCard
                key={item.id}
                title={item.title}
                meta={`${item.optionCount} option${
                  item.optionCount === 1 ? "" : "s"
                }`}
                date={timeAgo(item.chosenAt ?? item.createdAt)}
                result={item.selectedOption}
                resultLabel="CHOSE"
                resultBackground={answerColors[index % answerColorCount]}
                emptyLabel="No option was picked."
                onPress={() =>
                  router.push({
                    pathname: "/account/history/[id]",
                    params: { id: item.id },
                  })
                }
              />
            ))}
          </View>
        </>
      )}
    </ProfilePage>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    loader: { marginTop: 24 },
    summary: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
    list: { gap: 12 },
    card: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 24,
      gap: 12,
    },
    cardTitle: {
      flex: 1,
      fontFamily: f.medium,
      fontSize: 23,
      lineHeight: 29,
      color: c.ink,
    },
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
  });
