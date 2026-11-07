import { QueryClient, focusManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus, Platform } from "react-native";

// Sync focus state with React Native AppState for automatic background-to-foreground refetches
if (Platform.OS !== "web") {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        handleFocus(state === "active");
      },
    );
    return () => {
      subscription.remove();
    };
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
