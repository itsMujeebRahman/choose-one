import {
  anonymousClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
if (!baseURL)
  throw new Error("Configure production and its API URL in apps/mobile/.env.local, then start through npm.");
export const authClient = createAuthClient({
  baseURL,
  plugins: [
    anonymousClient(),
    inferAdditionalFields({
      user: {
        nameConfirmed: {
          type: "boolean",
          defaultValue: false,
          required: false,
          input: true,
        },
        isAnonymous: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
      },
    }),
    ...(Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: "chooseone",
            storagePrefix: "chooseone",
            storage: SecureStore,
          }),
        ]),
  ],
});
