import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors as c, fonts as f } from "../../theme/tokens";

type Section = "Profile" | "History" | "Settings";
const paths: Record<Section, string> = {
  Profile: "M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  History: "M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7m2-4v5l3 2",
  Settings: "M4 7h16M4 17h16M9 4v6m6 4v6",
};
export default function ProfileSection({
  title,
  onPress,
}: {
  title: Section;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}
    >
      <View
        style={[
          s.icon,
          {
            backgroundColor:
              title === "Profile"
                ? c.mint
                : title === "History"
                  ? c.yellow
                  : c.lavender,
          },
        ]}
      >
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={c.ink}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          accessible={false}
        >
          <Path d={paths[title]} />
        </Svg>
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.arrow} accessible={false}>
        ↗
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: c.surface,
    borderRadius: 24,
    padding: 16,
    minHeight: 76,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontFamily: f.medium, fontSize: 18, color: c.ink },
  arrow: { fontFamily: f.regular, fontSize: 23, color: c.muted },
});
