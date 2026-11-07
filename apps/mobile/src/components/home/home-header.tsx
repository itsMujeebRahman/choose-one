import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BlurViewProps } from "expo-blur";
import AppTitle from "./app-title";
import TitleGlassBackground from "./title-glass-background";

type Props = {
  userName: string;
  isGuest?: boolean;
  target: NonNullable<BlurViewProps["blurTarget"]>;
  height: number;
  onHeightChange: (height: number) => void;
};
export default function HomeHeader({
  userName,
  isGuest,
  target,
  height,
  onHeightChange,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={styles.header}>
      <TitleGlassBackground target={target} height={height + 12} />
      <View
        pointerEvents="box-none"
        onLayout={(event) => onHeightChange(event.nativeEvent.layout.height)}
        style={{
          paddingTop: insets.top + 12,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20,
        }}
      >
        <AppTitle userName={userName} isGuest={isGuest} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { position: "absolute", top: 0, left: 0, right: 0 },
});
