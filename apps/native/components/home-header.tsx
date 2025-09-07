import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

export function HomeHeader() {
  const { data: session } = authClient.useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View className="border-border/50 border-b bg-background">
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* Left: App name */}
        <View className="flex-row items-center gap-2">
          <Ionicons color="#4C6EF5" name="code-slash" size={24} />
          <Text className="font-bold text-foreground text-xl">Gister</Text>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-3">
          <ThemeToggle />
          {session?.user && (
            <View className="relative">
              <Pressable
                accessibilityLabel="Account menu"
                accessibilityRole="button"
                className="flex-row items-center gap-2 rounded-full bg-secondary/50 px-3 py-2"
                onPress={() => setShowMenu(!showMenu)}
              >
                <Ionicons color="#64748b" name="person-circle" size={20} />
                <Text className="font-medium text-foreground text-sm">
                  {session.user.name?.split(" ")[0] ?? "Account"}
                </Text>
                <Ionicons
                  color="#64748b"
                  name={showMenu ? "chevron-up" : "chevron-down"}
                  size={14}
                />
              </Pressable>

              {showMenu && (
                <View className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  <Pressable
                    className="flex-row items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/70"
                    onPress={() => {
                      setShowMenu(false);
                      // TODO: Navigate to profile
                    }}
                  >
                    <Ionicons color="#64748b" name="person" size={18} />
                    <Text className="text-foreground text-sm">Profile</Text>
                  </Pressable>

                  <View className="mx-2 h-px bg-border" />

                  <Pressable
                    className="flex-row items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/70"
                    onPress={() => {
                      setShowMenu(false);
                      authClient.signOut();
                    }}
                  >
                    <Ionicons color="#ef4444" name="log-out" size={18} />
                    <Text className="text-destructive text-sm">Sign Out</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Backdrop to close menu */}
      {showMenu && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setShowMenu(false)}
        />
      )}
    </View>
  );
}
