import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme, View } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./tokens";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  ready: boolean;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "chooseone.theme-mode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isThemeMode(stored)) setModeState(stored);
      })
      .catch(() => {
        /* Fall back to following the system theme. */
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      /* The choice still applies for this session. */
    });
  }, []);

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      /* Not supported on every platform. */
    });
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      document.documentElement.style.backgroundColor = colors.background;
    }
  }, [colors.background, isDark]);

  const value = useMemo(
    () => ({ colors, isDark, mode, ready, setMode }),
    [colors, isDark, mode, ready, setMode],
  );

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            systemScheme === "dark"
              ? darkColors.background
              : lightColors.background,
        }}
      />
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider.");
  return value;
}

export function useThemeColors() {
  return useTheme().colors;
}

export function useThemeStyles<T>(
  factory: (colors: ThemeColors) => T,
): [T, ThemeColors] {
  const { colors } = useTheme();
  const styles = useMemo(() => factory(colors), [colors, factory]);
  return [styles, colors];
}
