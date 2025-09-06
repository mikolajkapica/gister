import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

export function HomeHeader() {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  return (
    <View className="mx-auto w-[80%] flex-row items-center justify-between px-4 py-2">
      {/* Left: App name */}
      <Text
        accessibilityRole="header"
        className={["text-foreground", "text-lg", "font-semibold"]
          .join(" ")
          .trim()}
      >
        Gister
      </Text>

      {/* Right: Account dropdown */}
      {session?.user ? (
        <View className="relative">
          <Pressable
            accessibilityLabel="Account menu"
            accessibilityRole="button"
            className={[
              "flex-row",
              "items-center",
              "rounded-full",
              "border",
              "border-border/60",
              "bg-card",
              "px-3",
              "py-1.5",
            ]
              .join(" ")
              .trim()}
            onPress={() => setOpen((v) => !v)}
          >
            <Text
              className={["mr-1", "text-foreground", "text-sm", "font-medium"]
                .join(" ")
                .trim()}
            >
              {session.user.name ?? "Account"}
            </Text>
            <Ionicons
              color="#64748b"
              name={open ? "chevron-up" : "chevron-down"}
              size={14}
            />
          </Pressable>

          {open ? (
            <View
              accessible
              className={[
                "absolute",
                "right-0",
                "mt-2",
                "w-40",
                "rounded-md",
                "border",
                "border-border/40",
                "bg-background",
                "shadow-lg",
              ]
                .join(" ")
                .trim()}
            >
              <Pressable
                accessibilityRole="button"
                className={["px-3", "py-2"].join(" ").trim()}
                onPress={() => setOpen(false)}
              >
                <Text
                  className={["text-foreground", "text-sm"].join(" ").trim()}
                >
                  Profile
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className={["px-3", "py-2"].join(" ").trim()}
                onPress={() => {
                  setOpen(false);
                  authClient.signOut();
                  queryClient.invalidateQueries();
                }}
              >
                <Text
                  className={["text-destructive", "text-sm"].join(" ").trim()}
                >
                  Sign Out
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : (
        <Button accessibilityLabel="Sign in">Sign In</Button>
      )}
    </View>
  );
}
