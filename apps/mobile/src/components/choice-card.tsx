import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors as c, fonts as f } from "../theme/tokens";

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
  resultBackground = c.surface,
  emptyLabel,
  onPress,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.65 }]}
    >
      <View style={s.heading}>
        <Text style={s.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={s.arrow} accessible={false}>
          ↗
        </Text>
      </View>
      <View style={s.metaRow}>
        <Text style={s.meta}>{meta}</Text>
        <Text style={s.meta}>{date}</Text>
      </View>
      {result ? (
        <View style={[s.result, { backgroundColor: resultBackground }]}>
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
const s = StyleSheet.create({
  card: {
    backgroundColor: c.peachLight,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: {
    flex: 1,
    fontFamily: f.medium,
    fontSize: 19,
    lineHeight: 24,
    color: c.ink,
  },
  arrow: { fontFamily: f.regular, fontSize: 19, color: c.muted },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  meta: { fontFamily: f.regular, fontSize: 13, color: c.muted },
  result: {
    marginTop: 2,
    borderRadius: 12,
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
