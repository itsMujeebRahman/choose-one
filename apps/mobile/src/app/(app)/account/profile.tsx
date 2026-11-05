import { StyleSheet, Text, View } from "react-native";
import ProfilePage from "../../../components/profile/profile-page";
import ProfileHeader from "../../../components/profile/profile-header";
import { useAppSession } from "../../../lib/session";
import { colors as c, fonts as f } from "../../../theme/tokens";

export default function AccountProfileScreen() {
  const { data: session } = useAppSession();
  if (!session) return null;
  return (
    <ProfilePage title="Profile">
      <ProfileHeader name={session.user.name} email={session.user.email} />
      <View style={s.card}>
        <Text style={s.label}>Name</Text>
        <Text selectable style={s.value}>
          {session.user.name}
        </Text>
        <View style={s.divider} />
        <Text style={s.label}>Email</Text>
        <Text selectable style={s.value}>
          {session.user.email}
        </Text>
      </View>
    </ProfilePage>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: 28, padding: 24, gap: 8 },
  label: { fontFamily: f.medium, fontSize: 12, color: c.muted },
  value: { fontFamily: f.regular, fontSize: 18, color: c.ink },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 12 },
});
