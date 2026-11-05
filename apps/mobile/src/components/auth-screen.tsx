import { useErrorToast } from "../hooks/use-error-toast";
import SocialIcon from "./social-icon";
import { toast } from "sonner-native";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "../lib/auth-client";
import { colors as c, fonts as f, radius } from "../theme/tokens";

export function MoodGarden({ compact = false }: { compact?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[s.garden, compact && s.compactGarden]}
    >
      <View style={[s.bloom, s.bloomYellow]}>
        <Text style={s.face}>⌣</Text>
        <View style={s.eyes}>
          <View style={s.eye} />
          <View style={s.eye} />
        </View>
      </View>
      <View style={[s.bloom, s.bloomLavender]}>
        <Text style={s.face}>⌣</Text>
        <View style={s.eyes}>
          <View style={s.eye} />
          <View style={s.eye} />
        </View>
      </View>
      <View style={[s.bloom, s.bloomSage]}>
        <Text style={s.face}>⌣</Text>
        <View style={s.eyes}>
          <View style={s.eye} />
          <View style={s.eye} />
        </View>
      </View>
      <View style={s.spark}>
        <Text style={s.sparkText}>✳</Text>
      </View>
      <View style={s.littleDot} />
      <View style={s.petal} />
    </View>
  );
}
export default function AuthScreen() {
  const { width } = useWindowDimensions();
  const { refetch } = authClient.useSession();
  const wide = width >= 900;
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);
  const params = useLocalSearchParams<{ error?: string }>();
  useErrorToast(params.error, "Sign-in wasn’t completed. Please try again.", "auth-callback-error");
  function reportError(message: string) {
    toast.error(message);
  }
  async function signIn(provider: "google" | "apple") {
    if (busy) return;
    if (Platform.OS !== "web" && Constants.appOwnership === "expo") {
      reportError("Social sign-in needs a development build. Open Choose One in its development build to continue.");
      return;
    }
    setBusy(provider);
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: Platform.OS === "web" ? "/" : "chooseone:///",
        errorCallbackURL: Platform.OS === "web" ? "/auth" : "chooseone:///auth",
      });
      if (result.error) reportError(result.error.message ?? "Sign-in couldn’t start. Please try again.");
      else if (Platform.OS !== "web") {
        const restored = await authClient.getSession({ query: { disableCookieCache: true } });
        if (restored.error) reportError("Couldn’t restore your session. Please try again.");
        else if (!restored.data) reportError("Sign-in wasn’t completed. Try again when you’re ready.");
        await refetch();
      }
    } catch { reportError("We couldn’t connect to sign-in. Please try again."); }
    finally { setBusy(null); }
  }
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={[s.page, wide && s.widePage]}>
      <View style={[s.story, wide && s.wideStory]}>
        <View style={s.brand}><Text style={s.brandMark}>❖</Text><Text style={s.brandName}>choose one</Text><View style={s.brandDot}/></View>
        {wide && <View style={s.storyCopy}><Text style={s.eyebrow}>A LITTLE SPACE FOR YOU</Text><Text style={s.storyTitle}>Big feelings.{"\n"}Small steps.{"\n"}<Text style={{ fontFamily: f.semibold }}>Your own pace.</Text></Text><Text style={s.storyBody}>You don’t have to have it all figured out.{"\n"}Just start with one little choice.</Text></View>}
        <MoodGarden compact={!wide}/>
        {wide && <View style={s.storyFooter}><Text style={s.pill}>A softer kind of everyday</Text><Text style={s.footerStar}>✳</Text></View>}
      </View>
      <View style={[s.formSide, wide && s.wideFormSide]}>
        <View style={s.topLine}><Text style={s.step}>YOUR LITTLE RESET</Text><Text style={s.tinyFlower}>✳</Text></View>
        <Text style={s.title}>A little space,{"\n"}<Text style={s.bold}>just for you.</Text></Text>
        <Text style={s.subtitle}>A fresh start or a familiar hello. Choose Google or Apple and make yourself at home.</Text>
        {(["google", "apple"] as const).map((provider, index) => (
          <Pressable key={provider} accessibilityRole="button" accessibilityLabel={`Sign in with ${provider === "google" ? "Google" : "Apple"}`} disabled={!!busy} onPress={() => signIn(provider)} style={({ pressed }) => [s.submit, s.socialButton, index > 0 && { marginTop: 12 }, (pressed || busy) && { opacity: .65 }]}>
            {busy === provider ? <ActivityIndicator color={c.ink}/> : <>
              <View style={s.socialIcon}><SocialIcon provider={provider}/></View>
              <Text style={[s.submitText, { color: c.ink }]}>Sign in with {provider === "google" ? "Google" : "Apple"}</Text>
            </>}
          </Pressable>
        ))}
        <Text style={s.note}>No password to remember. Just you.</Text>
        <View style={s.bottomNote}><View style={s.miniDot}/><Text style={s.bottomText}>A little kinder to yourself, every day.</Text></View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  socialButton: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1.5 },
  socialIcon: { width: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: c.background },
  page: {
    flexGrow: 1,
    padding: 20,
    maxWidth: 1440,
    width: "100%",
    alignSelf: "center",
  },
  widePage: { flexDirection: "row", padding: 28, gap: 48, minHeight: 850 },
  story: { overflow: "hidden" },
  wideStory: {
    backgroundColor: c.peach,
    borderRadius: radius.large,
    flex: 1.05,
    padding: 36,
    minHeight: 790,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { fontSize: 36, color: c.ink },
  brandName: {
    fontFamily: f.medium,
    fontSize: 23,
    letterSpacing: -1,
    color: c.ink,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.sage,
    marginTop: 10,
  },
  storyCopy: { marginTop: 54 },
  eyebrow: {
    fontFamily: f.medium,
    fontSize: 11,
    letterSpacing: 2,
    color: c.muted,
  },
  storyTitle: {
    fontFamily: f.regular,
    fontSize: 56,
    lineHeight: 61,
    letterSpacing: -2.5,
    color: c.ink,
    marginTop: 22,
  },
  storyBody: {
    fontFamily: f.regular,
    color: c.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
  },
  garden: { height: 260, marginTop: 25, position: "relative", width: "100%" },
  compactGarden: {
    height: 135,
    width: 285,
    alignSelf: "center",
    marginTop: 8,
    transform: [{ scale: 0.65 }],
    marginBottom: -15,
  },
  bloom: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: c.ink,
  },
  bloomYellow: {
    backgroundColor: c.yellow,
    left: "2%",
    top: 62,
    transform: [{ rotate: "-12deg" }],
  },
  bloomLavender: {
    backgroundColor: c.lavender,
    left: "32%",
    top: 0,
    borderTopLeftRadius: 25,
    transform: [{ rotate: "12deg" }],
  },
  bloomSage: {
    backgroundColor: c.sage,
    left: "58%",
    top: 100,
    borderBottomRightRadius: 28,
    transform: [{ rotate: "12deg" }],
  },
  face: { fontSize: 65, lineHeight: 85, color: c.ink },
  eyes: { position: "absolute", top: 49, flexDirection: "row", gap: 24 },
  eye: { width: 5, height: 9, borderRadius: 5, backgroundColor: c.ink },
  spark: { position: "absolute", right: "5%", top: 10 },
  sparkText: { fontSize: 52, color: c.ink },
  littleDot: {
    width: 19,
    height: 19,
    backgroundColor: c.coral,
    borderRadius: 10,
    left: "8%",
    top: 4,
    position: "absolute",
  },
  petal: {
    width: 48,
    height: 22,
    backgroundColor: c.blue,
    borderRadius: 30,
    position: "absolute",
    bottom: 5,
    left: "31%",
    transform: [{ rotate: "-35deg" }],
  },
  storyFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  pill: {
    fontFamily: f.regular,
    fontSize: 12,
    color: c.ink,
    borderColor: "#B6A99F",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  footerStar: { fontSize: 28, color: c.ink },
  formSide: {
    paddingHorizontal: 4,
    paddingTop: 6,
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
  },
  wideFormSide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    marginRight: 24,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  step: {
    fontFamily: f.medium,
    fontSize: 10,
    letterSpacing: 1.8,
    color: c.muted,
  },
  tinyFlower: { fontSize: 28, color: c.sage },
  formHeading: { marginBottom: 24 },
  title: {
    fontFamily: f.regular,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.6,
    color: c.ink,
  },
  bold: { fontFamily: f.semibold },
  subtitle: {
    fontFamily: f.regular,
    color: c.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  tabs: {
    flexDirection: "row",
    padding: 5,
    backgroundColor: "#EAE8ED",
    borderRadius: radius.pill,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    borderRadius: radius.pill,
    padding: 12,
    alignItems: "center",
  },
  activeTab: { backgroundColor: c.surface },
  tabText: { fontFamily: f.medium, fontSize: 14, color: c.muted },
  activeTabText: { color: c.ink },
  fields: { gap: 17 },
  label: {
    fontFamily: f.medium,
    color: c.ink,
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 3,
  },
  input: {
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: radius.small,
    minHeight: 56,
    paddingHorizontal: 18,
    fontFamily: f.regular,
    fontSize: 15,
    color: c.ink,
  },
  focused: { borderColor: c.sage },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: radius.small,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    paddingHorizontal: 18,
    fontFamily: f.regular,
    fontSize: 15,
    color: c.ink,
  },
  showButton: {
    minHeight: 48,
    minWidth: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  showText: { fontFamily: f.medium, fontSize: 12, color: c.muted },
  submit: {
    borderRadius: radius.pill,
    minHeight: 58,
    marginTop: 25,
    backgroundColor: c.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  submitText: { fontFamily: f.medium, fontSize: 16, color: c.surface },
  arrow: { color: c.surface, fontSize: 25, position: "absolute", right: 24 },
  note: {
    textAlign: "center",
    fontFamily: f.regular,
    fontSize: 12,
    color: c.muted,
    marginTop: 15,
  },
  bottomNote: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingBottom: 12,
  },
  miniDot: { width: 8, height: 8, backgroundColor: c.sage, borderRadius: 4 },
  bottomText: { fontFamily: f.regular, fontSize: 11, color: c.muted },
});
