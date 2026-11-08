import Constants from "expo-constants";

const value: unknown = Constants.expoConfig?.extra?.apiUrl;
if (typeof value !== "string" || !value) {
  throw new Error("Configure production and its API URL in apps/mobile/.env.local, then restart Expo.");
}
export const apiUrl = value;
