import { useRef, type ComponentRef, type Ref } from "react";
import { BlurTargetView } from "expo-blur";
import SlidingTabBackground from "../../../components/navigation/sliding-tab-background";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs, usePathname } from "expo-router";
import TabIcon from "../../../components/navigation/tab-icon";
import { fonts } from "../../../theme/tokens";
import { useTheme } from "../../../theme/theme";

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { colors } = useTheme();
  const homeTarget = useRef<ComponentRef<typeof View> | null>(null);
  const listsTarget = useRef<ComponentRef<typeof View> | null>(null);
  const profileTarget = useRef<ComponentRef<typeof View> | null>(null);
  const { width } = useWindowDimensions();
  const availableWidth = width - insets.left - insets.right;
  const barWidth = Math.min(280, availableWidth - 48);
  const sideGap = (availableWidth - barWidth) / 2;
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenLayout={({ children, route }) =>
        Platform.OS === "android" ? (
          <BlurTargetView
            ref={
              route.name === "profile"
                ? profileTarget
                : route.name === "lists"
                  ? listsTarget
                  : homeTarget
            }
            style={{ flex: 1 }}
          >
            {children}
          </BlurTargetView>
        ) : (
          <>{children}</>
        )
      }
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: "transparent",
        tabBarButton: ({ style, children, ref, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ color: "transparent" }}
            ref={ref as Ref<ComponentRef<typeof Pressable>>}
            style={[
              style,
              { borderRadius: 999, overflow: "hidden" },
            ]}
          >
            {children}
          </Pressable>
        ),
        tabBarBackground: () => (
          <SlidingTabBackground
            target={
              pathname === "/profile"
                ? profileTarget
                : pathname === "/lists"
                  ? listsTarget
                  : homeTarget
            }
            activeIndex={
              pathname === "/profile" ? 2 : pathname === "/lists" ? 1 : 0
            }
            count={3}
            width={barWidth}
          />
        ),
        tabBarStyle: {
          position: "absolute",
          // Override the navigator's default start/end anchors to prevent stretching.
          width: barWidth,
          start: insets.left + sideGap,
          end: undefined,
          bottom: Math.max(insets.bottom, 16) + 12,
          height: 72,
          paddingHorizontal: 0,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 36,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          borderRadius: 999,
          overflow: "hidden",
          marginHorizontal: 8,
          marginVertical: 0,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Lists",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="lists" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
