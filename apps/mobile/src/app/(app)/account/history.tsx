import { StyleSheet, Text, View } from "react-native";
import ProfilePage from "../../../components/profile/profile-page";
import { colors as c, fonts as f } from "../../../theme/tokens";

export default function HistoryScreen() {
  return (
    <ProfilePage title="History">
      <View style={s.card}>
        <Text style={s.title}>Your little decisions.</Text>
        <Text style={s.body}>
          Your choices are saved when you pick an option. Viewing past decisions
          here is coming soon.
        </Text>
      </View>
    </ProfilePage>
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: c.peachLight,
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  title: { fontFamily: f.medium, fontSize: 23, color: c.ink },
  body: { fontFamily: f.regular, fontSize: 16, lineHeight: 24, color: c.muted },
});
