import { toast } from "sonner-native";
import { useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authClient } from '../../lib/auth-client';
import { colors as c, fonts as f } from '../../theme/tokens';

export default function CompleteProfile() {
  const { data: session, refetch } = authClient.useSession();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  if (!session) return null;
  if (session.user.nameConfirmed) return <Redirect href="/" />;
  function reportError(message: string) {
    toast.error(message);
  }
  async function save() {
    if (busy) return;
    const value = name.trim();
    if (!value || value.length > 100) { reportError('Choose a username between 1 and 100 characters.'); return; }
    setBusy(true);
    try {
      const result = await authClient.updateUser({ name: value, nameConfirmed: true });
      if (result.error) reportError(result.error.message ?? 'Couldn’t save your username. Please try again.');
      else { toast.success('You’re all set. Welcome home!'); await refetch(); }
    } catch { reportError('Couldn’t connect. Please try again.'); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={s.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.card}>
    <Text style={s.brand}>❖ choose one</Text><Text style={s.title}>Make yourself{ '\n'}at home.</Text><Text style={s.body}>Pick a username. That’s all we need to get started.</Text>
    <Text style={s.label}>Username</Text><TextInput accessibilityLabel="Username" placeholder="Your username" placeholderTextColor={c.muted} autoCapitalize="none" autoCorrect={false} maxLength={100} value={name} onChangeText={setName} style={s.input} editable={!busy} returnKeyType="done" onSubmitEditing={save}/>
    <Pressable accessibilityRole="button" disabled={busy} onPress={save} style={s.button}>{busy ? <ActivityIndicator color={c.surface}/> : <Text style={s.buttonText}>Make myself at home ↗</Text>}</Pressable>
  </View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background }, content: { flexGrow: 1, justifyContent: 'center', padding: 20 }, card: { padding: 28, backgroundColor: c.peachLight, borderRadius: 36, width: '100%', maxWidth: 460, alignSelf: 'center' },
  brand: { fontFamily: f.medium, fontSize: 23, color: c.ink, marginBottom: 40 }, title: { fontFamily: f.regular, fontSize: 38, lineHeight: 42, color: c.ink, letterSpacing: -1.5 }, body: { fontFamily: f.regular, fontSize: 15, lineHeight: 22, color: c.muted, marginTop: 15 }, label: { fontFamily: f.medium, fontSize: 14, color: c.ink, marginTop: 30, marginBottom: 8 }, input: { fontFamily: f.regular, fontSize: 16, color: c.ink, backgroundColor: c.surface, borderRadius: 16, minHeight: 56, paddingHorizontal: 16 }, button: { marginTop: 24, minHeight: 56, backgroundColor: c.ink, borderRadius: 999, justifyContent: 'center', alignItems: 'center' }, buttonText: { color: c.surface, fontFamily: f.medium, fontSize: 15 },
});
