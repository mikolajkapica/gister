"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Platform } from "react-native";

export function DevTools() {
  // Only show devtools in development and on web
  if (Platform.OS !== "web" || process.env.NODE_ENV === "production") {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
}