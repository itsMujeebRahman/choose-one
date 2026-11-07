import ListInvitation from "../../../components/choice-lists/list-invitation";
import { sessionCardColor } from "../../../lib/session-card-color";
import KeyboardAwareScrollView from "../../../components/home/keyboard-aware-scroll-view";
import MascotPrompt from "../../../components/home/mascot-prompt";
import { useRef, useState, type ComponentRef } from "react";
import { StyleSheet, View } from "react-native";
import { BlurTargetView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeader from "../../../components/home/home-header";
import DecisionCard from "../../../components/decision-card/decision-card";
import { useAppSession } from "../../../lib/session";
import { type ThemeColors } from "../../../theme/tokens";
import { useThemeStyles } from "../../../theme/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [s, c] = useThemeStyles(createStyles);
  const target = useRef<ComponentRef<typeof View> | null>(null);
  const [headerHeight, setHeaderHeight] = useState(insets.top + 96);
  const { data: session } = useAppSession();
  if (!session) return null;
  const sectionStyle = {
    paddingLeft: insets.left + 20,
    paddingRight: insets.right + 20,
  };
  return (
    <View style={s.page}>
      <BlurTargetView ref={target} style={s.page}>
        <KeyboardAwareScrollView
          headerHeight={headerHeight}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: headerHeight,
            paddingBottom: Math.max(insets.bottom, 16) + 100,
          }}
        >
          <MascotPrompt />
          <View style={sectionStyle}>
            <DecisionCard
              userName={session.user.name}
              backgroundColor={sessionCardColor(
                session.session.id,
                session.session.createdAt,
                c,
              )}
            />
          </View>
          <View style={sectionStyle}>
            <ListInvitation />
          </View>
        </KeyboardAwareScrollView>
      </BlurTargetView>
      <HomeHeader
        userName={session.user.name}
        target={target}
        height={headerHeight}
        onHeightChange={setHeaderHeight}
      />
    </View>
  );
}
const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.background },
  });
