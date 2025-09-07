import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
// biome-ignore lint: Expo SecureStore integration expects the module object
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  scheme: "gister",
  plugins: [
    expoClient({
      scheme: "gister",
      storagePrefix: "gister",
      storage: SecureStore,
    }),
  ],
});
