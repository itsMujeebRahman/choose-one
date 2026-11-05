import ListInvitation from "../../../components/choice-lists/list-invitation";
import { sessionCardColor } from "../../../lib/session-card-color";
import KeyboardAwareScrollView from "../../../components/home/keyboard-aware-scroll-view";
import ScrollPreviewCards from "../../../components/home/scroll-preview-cards";
import { useRef, useState, type ComponentRef } from "react";
import { StyleSheet, View } from "react-native";
import { BlurTargetView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeader from "../../../components/home/home-header";
import DecisionCard from "../../../components/decision-card/decision-card";
import { useAppSession } from "../../../lib/session";
import { colors } from "../../../theme/tokens";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const target = useRef<ComponentRef<typeof View> | null>(null);
  const [headerHeight, setHeaderHeight] = useState(insets.top + 96);
  const { data: session } = useAppSession();
  if (!session) return null;
  return (
    <View style={styles.page}>
      <BlurTargetView ref={target} style={styles.page}>
        <KeyboardAwareScrollView
          headerHeight={headerHeight}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: headerHeight,
            paddingLeft: insets.left + 20,
            paddingRight: insets.right + 20,
            paddingBottom: Math.max(insets.bottom, 16) + 100,
          }}
        >
          <DecisionCard
            userName={session.user.name}
            backgroundColor={sessionCardColor(
              session.session.id,
              session.session.createdAt,
            )}
          />
          <ListInvitation />
          <ScrollPreviewCards />
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
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
});
