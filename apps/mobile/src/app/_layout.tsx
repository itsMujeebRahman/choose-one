import { useErrorToast } from "../hooks/use-error-toast";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { Outfit_400Regular } from "@expo-google-fonts/outfit/400Regular";
import { Outfit_500Medium } from "@expo-google-fonts/outfit/500Medium";
import { Outfit_600SemiBold } from "@expo-google-fonts/outfit/600SemiBold";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors, fonts } from "../theme/tokens";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });
  useErrorToast(error, "Couldn’t load the app font. Using the default font.", "font-error");
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Slot />
      <Toaster position="top-center" theme="light" toastOptions={{
        style: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16 },
        titleStyle: { fontFamily: fonts.medium, color: colors.ink },
        descriptionStyle: { fontFamily: fonts.regular, color: colors.muted },
      }} />
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
