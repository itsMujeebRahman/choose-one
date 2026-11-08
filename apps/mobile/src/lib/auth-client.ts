import {
  anonymousClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { apiUrl } from "./api-url";

export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: { timeout: 15000 },
  // AppState refreshes are coordinated with the sign-in flow in session.ts.
  sessionOptions: { refetchOnWindowFocus: false },
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
