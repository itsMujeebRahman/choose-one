import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors as c, fonts as f } from "../../theme/tokens";

export default function ProfileHeader({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <View style={s.header}>
      <View style={s.avatar}>
        <Svg
          width={32}
          height={32}
          viewBox="0 0 24 24"
          fill="none"
          stroke={c.ink}
          strokeWidth={1.6}
          strokeLinecap="round"
          accessible={false}
        >
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </Svg>
      </View>
      <View style={s.identity}>
        <Text style={s.name}>{name}</Text>
        <Text selectable style={s.email}>
          {email}
        </Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: c.peachLight,
    borderRadius: 28,
    padding: 20,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: c.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { flex: 1, gap: 4 },
  name: { fontFamily: f.medium, fontSize: 24, color: c.ink },
  email: { fontFamily: f.regular, fontSize: 14, color: c.muted },
});
