import KeyboardAwareScrollView from "../home/keyboard-aware-scroll-view";
import Svg, { Path } from "react-native-svg";
import type { ReactNode } from "react";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors as c, fonts as f } from "../../theme/tokens";

export default function ProfilePage({
  title,
  children,
  backTo = "/profile",
  backLabel = "Back to your profile",
}: {
  title: string;
  children: ReactNode;
  backTo?: Href;
  backLabel?: string;
}) {
  return (
    <SafeAreaView style={s.page}>
      <KeyboardAwareScrollView
        headerHeight={0}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        <View style={s.heading}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace(backTo)
            }
            style={({ pressed }) => [s.back, pressed && { opacity: 0.6 }]}
          >
            <Svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke={c.ink}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              accessible={false}
            >
              <Path d="m12 5-7 7 7 7M5 12h14" />
            </Svg>
          </Pressable>
          <Text style={s.title}>{title}</Text>
        </View>
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background },
  content: {
    padding: 24,
    gap: 24,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 14 },
  title: {
    flex: 1,
    fontFamily: f.regular,
    fontSize: 38,
    letterSpacing: -1.5,
    color: c.ink,
  },
});
