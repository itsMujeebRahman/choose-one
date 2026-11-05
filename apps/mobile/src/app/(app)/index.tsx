import { toast } from "sonner-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "../../lib/auth-client";
import { MoodGarden } from "../../components/auth-screen";
import { colors as c, fonts as f } from "../../theme/tokens";

export default function HomeScreen() {
  const { data: session } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  if (!session) return null;
  function reportError(message: string) {
    toast.error(message);
  }
  async function signOut() {
    setBusy(true);
    try {
      const result = await authClient.signOut();
      if (result.error) reportError("Couldn’t sign out. Please try again.");
      else toast.success("You’ve signed out.");
    } catch {
      reportError("Couldn’t connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={s.page}>
      <View style={s.card}>
        <Text style={s.brand}>❖ choose one</Text>
        <Text style={s.label}>YOUR SPACE TO BEGIN</Text>
        <Text style={s.title}>
          Hello, {session.user.name.split(" ")[0]}.{"\n"}Glad you’re here.
        </Text>
        <Text style={s.body}>
          One small choice can be a lovely place to start.
        </Text>
        <MoodGarden />
        <Text style={s.body}>You’re signed in as {session.user.email}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={signOut}
          style={s.button}
        >
          {busy ? (
            <ActivityIndicator color={c.surface} />
          ) : (
            <Text style={s.buttonText}>Sign out ↗</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: c.background,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    backgroundColor: c.peachLight,
    borderRadius: 36,
    padding: 28,
  },
  brand: { fontFamily: f.medium, fontSize: 24, color: c.ink, marginBottom: 36 },
  label: {
    fontFamily: f.medium,
    fontSize: 10,
    letterSpacing: 2,
    color: c.muted,
    marginBottom: 15,
  },
  title: {
    fontFamily: f.regular,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.4,
    color: c.ink,
  },
  body: {
    fontFamily: f.regular,
    fontSize: 14,
    color: c.muted,
    lineHeight: 22,
    marginTop: 14,
  },
  button: {
    marginTop: 24,
    padding: 18,
    borderRadius: 999,
    backgroundColor: c.ink,
    alignItems: "center",
  },
  buttonText: { fontFamily: f.medium, color: c.surface, fontSize: 15 },
});
