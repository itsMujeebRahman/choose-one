import { useErrorToast } from "../hooks/use-error-toast";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { Outfit_400Regular } from "@expo-google-fonts/outfit/400Regular";
import { Outfit_500Medium } from "@expo-google-fonts/outfit/500Medium";
import { Outfit_600SemiBold } from "@expo-google-fonts/outfit/600SemiBold";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import FightLoader from "../components/feedback/fight-loader";
import { fonts } from "../theme/tokens";
import { ThemeProvider, useTheme } from "../theme/theme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { colors, isDark } = useTheme();
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });
  useErrorToast(
    error,
    "Couldn’t load the app font. Using the default font.",
    "font-error",
  );
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <FightLoader />
      </View>
    );
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Slot />
        <Toaster
          position="top-center"
          theme={isDark ? "dark" : "light"}
          toastOptions={{
            style: {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 16,
            },
            titleStyle: { fontFamily: fonts.medium, color: colors.ink },
            descriptionStyle: {
              fontFamily: fonts.regular,
              color: colors.muted,
            },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
