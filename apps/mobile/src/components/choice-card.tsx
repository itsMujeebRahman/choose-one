import { Pressable, StyleSheet, Text, View } from "react-native";
import { fonts as f, type ThemeColors } from "../theme/tokens";
import { useThemeStyles } from "../theme/theme";

export type ChoiceCardProps = {
  title: string;
  meta: string;
  date: string;
  resultLabel?: string;
  result?: string | null;
  resultBackground?: string;
  emptyLabel?: string;
  onPress: () => void;
};

export default function ChoiceCard({
  title,
  meta,
  date,
  resultLabel = "LATEST",
  result,
  resultBackground,
  emptyLabel,
  onPress,
}: ChoiceCardProps) {
  const [s, c] = useThemeStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.65 }]}
    >
      <View style={s.topRow}>
        <Text style={s.meta}>{meta}</Text>
        <Text style={s.arrow} accessible={false}>
          ↗
        </Text>
      </View>
      <View style={s.headingRow}>
        <Text style={s.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={s.time}>{date}</Text>
      </View>
      {result ? (
        <View
          style={[s.result, { backgroundColor: resultBackground ?? c.surface }]}
        >
          {!!resultLabel && <Text style={s.resultLabel}>{resultLabel}</Text>}
          <Text style={s.resultValue} numberOfLines={1}>
            {result}
          </Text>
        </View>
      ) : emptyLabel ? (
        <Text style={s.empty}>{emptyLabel}</Text>
      ) : null}
    </Pressable>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 22,
      gap: 10,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    meta: { fontFamily: f.medium, fontSize: 13, color: c.muted },
    arrow: { fontFamily: f.regular, fontSize: 20, color: c.muted },
    headingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    title: {
      flex: 1,
      fontFamily: f.medium,
      fontSize: 20,
      lineHeight: 26,
      color: c.ink,
      letterSpacing: -0.4,
    },
    time: {
      fontFamily: f.regular,
      fontSize: 13,
      color: c.muted,
      flexShrink: 0,
    },
    result: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    resultLabel: {
      fontFamily: f.medium,
      color: c.muted,
      fontSize: 9,
      letterSpacing: 1.1,
    },
    resultValue: {
      flex: 1,
      fontFamily: f.medium,
      fontSize: 15,
      color: c.ink,
    },
    empty: { fontFamily: f.regular, color: c.muted, fontSize: 13 },
  });
