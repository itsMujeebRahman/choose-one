// Sampled from the supplied Nixtio reference. See DESIGN.md for provenance.
export type ThemeColors = {
  background: string;
  surface: string;
  ink: string;
  muted: string;
  peach: string;
  peachLight: string;
  lavender: string;
  yellow: string;
  sage: string;
  blue: string;
  coral: string;
  mint: string;
  border: string;
  subtle: string;
  outline: string;
  error: string;
};

export const lightColors: ThemeColors = {
  background: "#F5F4F9",
  surface: "#FFFFFF",
  ink: "#131313",
  muted: "#686560",
  peach: "#EBDCD2",
  peachLight: "#F0E6E0",
  lavender: "#C0C8F5",
  yellow: "#EFDF95",
  sage: "#90986C",
  blue: "#85A3D6",
  coral: "#D69683",
  mint: "#CDDFDD",
  border: "#E5E2E3",
  subtle: "#EAE8ED",
  outline: "#B6A99F",
  error: "#9C332B",
};

export const colors = lightColors;

export const darkColors: ThemeColors = {
  background: "#111216",
  surface: "#1A1D24",
  ink: "#F4F5F8",
  muted: "#9499A8",
  peach: "#322723",
  peachLight: "#1F2129",
  lavender: "#25283C",
  yellow: "#332D1C",
  sage: "#222B1E",
  blue: "#1C293D",
  coral: "#352320",
  mint: "#1B2E2A",
  border: "#282B35",
  subtle: "#232630",
  outline: "#3A3E4D",
  error: "#F4766A",
};

export const fonts = {
  regular: "Outfit_400Regular",
  medium: "Outfit_500Medium",
  semibold: "Outfit_600SemiBold",
};
export const radius = { small: 16, medium: 24, large: 36, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
