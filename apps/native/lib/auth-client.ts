import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
// biome-ignore lint: Expo SecureStore integration expects the module object
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
	plugins: [
		expoClient({
			scheme: "my-better-t-app",
			storagePrefix: "my-better-t-app",
			storage: SecureStore,
		}),
	],
});
