import { StyleSheet, Text, View } from "react-native";
import ProfilePage from "../../../components/profile/profile-page";
import { colors as c, fonts as f } from "../../../theme/tokens";

export default function SettingsScreen() {
  return (
    <ProfilePage title="Settings">
      <View style={s.card}>
        <Text style={s.title}>Make yourself at home.</Text>
        <Text style={s.body}>App preferences are coming soon.</Text>
      </View>
    </ProfilePage>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: c.mint, borderRadius: 28, padding: 24, gap: 12 },
  title: { fontFamily: f.medium, fontSize: 23, color: c.ink },
  body: { fontFamily: f.regular, fontSize: 16, lineHeight: 24, color: c.muted },
});
