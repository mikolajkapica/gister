import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import * as Linking from "expo-linking";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { DevTools } from "@/components/dev-tools";
import { LoadingScreen } from "@/components/loading-screen";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { authClient } from "@/lib/auth-client";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { queryClient } from "@/utils/trpc";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const { isPending, refetch } = authClient.useSession();

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  // Listen for deep link events to refresh session after authentication
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      // If this is a deep link from authentication, refresh the session
      if (url.includes("my-better-t-app://")) {
        refetch();
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Also check initial URL
    Linking.getInitialURL().then((url: string | null) => {
      if (url?.includes("my-better-t-app://")) {
        refetch();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [refetch]);

  if (!isColorSchemeLoaded || isPending) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <GestureHandlerRootView
          className={isDarkColorScheme ? "dark" : ""}
          style={{ flex: 1 }}
        >
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="gist/[id]"
              options={{
                title: "Gist",
                headerBackTitle: "Back",
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ title: "Modal", presentation: "modal" }}
            />
          </Stack>
          <DevTools />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
