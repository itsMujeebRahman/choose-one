import { useCallback } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import DecisionButton from "../../../../components/decision-card/decision-button";
import {
  answerColorCount,
  getAnswerColors,
} from "../../../../components/decision-card/choice-result";
import FightLoader from "../../../../components/feedback/fight-loader";
import ProfilePage from "../../../../components/profile/profile-page";
import { formatHistoryDate, formatHistoryDateTime } from "../../../../lib/date";
import { useHistoryDetailQuery } from "../../../../services/history";
import { fonts as f, type ThemeColors } from "../../../../theme/tokens";
import { useThemeStyles } from "../../../../theme/theme";

export default function HistoryDetailScreen() {
  const [s, c] = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: choice = null,
    isLoading: loading,
    isError: failed,
    refetch,
  } = useHistoryDetailQuery(id);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const chosen = choice?.options.find((option) => option.isSelected);
  const answerColor = chosen
    ? getAnswerColors(c)[(chosen.sortOrder - 1) % answerColorCount]
    : undefined;
  return (
    <ProfilePage
      title={choice?.title ?? "Choice"}
      backTo="/account/history"
      backLabel="Back to your history"
    >
      {loading ? (
        <FightLoader style={s.loader} />
      ) : failed || !choice ? (
        <View style={s.card}>
          <Text style={s.sectionTitle}>We couldn’t load this choice.</Text>
          <Text style={s.body}>
            It may have been removed, or your connection dropped. Try again.
          </Text>
          <DecisionButton
            label="Try again"
            secondary
            onPress={() => void refetch()}
          />
        </View>
      ) : (
        <>
          <Text style={s.body}>
            {chosen
              ? `Chosen ${formatHistoryDate(choice.chosenAt ?? choice.createdAt)}`
              : `Saved ${formatHistoryDate(choice.createdAt)}`}{" "}
            - {choice.options.length} option
            {choice.options.length === 1 ? "" : "s"} considered
          </Text>
          {chosen ? (
            <View style={[s.answer, { backgroundColor: answerColor }]}>
              <Text style={s.eyebrow}>YOUR CHOICE</Text>
              <Text selectable style={s.answerTitle}>
                {chosen.label}
              </Text>
              <Text style={s.body}>
                A nudge to get you started. The choice is still yours.
              </Text>
            </View>
          ) : (
            <View style={s.card}>
              <Text style={s.sectionTitle}>No option was picked.</Text>
              <Text style={s.body}>
                This choice was saved before an option was selected.
              </Text>
            </View>
          )}
          <Text style={s.sectionTitle}>The options you considered</Text>
          <View style={s.options}>
            {choice.options.map((option) => (
              <View
                key={option.id}
                style={[s.option, option.isSelected && s.optionSelected]}
              >
                <Text
                  style={[
                    s.optionNumber,
                    option.isSelected && s.optionNumberSelected,
                  ]}
                >
                  {option.sortOrder}
                </Text>
                <Text
                  selectable
                  style={[
                    s.optionLabel,
                    option.isSelected && s.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.isSelected && <Text style={s.badge}>CHOSEN</Text>}
              </View>
            ))}
          </View>
          <Text style={s.meta}>
            Saved {formatHistoryDateTime(choice.createdAt)}
          </Text>
        </>
      )}
    </ProfilePage>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    loader: { marginTop: 24 },
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
    meta: { fontFamily: f.regular, fontSize: 13, color: c.muted },
    card: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 24,
      gap: 12,
    },
    answer: {
      backgroundColor: c.yellow,
      borderRadius: 36,
      padding: 24,
      gap: 12,
    },
    eyebrow: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.5,
      color: c.muted,
    },
    answerTitle: {
      fontFamily: f.medium,
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.8,
      color: c.ink,
    },
    sectionTitle: {
      fontFamily: f.medium,
      fontSize: 22,
      lineHeight: 28,
      color: c.ink,
    },
    options: { gap: 10 },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 18,
      padding: 18,
    },
    optionSelected: { backgroundColor: c.mint },
    optionNumber: {
      width: 24,
      fontFamily: f.medium,
      fontSize: 13,
      color: c.muted,
    },
    optionNumberSelected: { color: c.ink },
    optionLabel: {
      flex: 1,
      fontFamily: f.regular,
      fontSize: 17,
      lineHeight: 23,
      color: c.muted,
    },
    optionLabelSelected: { fontFamily: f.medium, color: c.ink },
    badge: {
      fontFamily: f.medium,
      fontSize: 9,
      letterSpacing: 1.2,
      color: c.ink,
    },
  });
