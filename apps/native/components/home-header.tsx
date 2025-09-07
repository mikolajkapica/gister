import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

export function HomeHeader() {
  const { data: session } = authClient.useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View className="bg-background border-b border-border/50">
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* Left: App name */}
        <View className="flex-row items-center gap-2">
          <Ionicons name="code-slash" size={24} color="#4C6EF5" />
          <Text className="text-foreground text-xl font-bold">
            Gister
          </Text>
        </View>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-3">
          <ThemeToggle />
          {session?.user ? (
            <View className="relative">
              <Pressable
                accessibilityLabel="Account menu"
                accessibilityRole="button"
                className="flex-row items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full"
                onPress={() => setShowMenu(!showMenu)}
              >
                <Ionicons name="person-circle" size={20} color="#64748b" />
                <Text className="text-foreground text-sm font-medium">
                  {session.user.name?.split(' ')[0] ?? "Account"}
                </Text>
                <Ionicons
                  name={showMenu ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#64748b"
                />
              </Pressable>

              {showMenu && (
                <View className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  <Pressable
                    className="flex-row items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/70"
                    onPress={() => {
                      setShowMenu(false);
                      // TODO: Navigate to profile
                    }}
                  >
                    <Ionicons name="person" size={18} color="#64748b" />
                    <Text className="text-foreground text-sm">Profile</Text>
                  </Pressable>

                  <View className="h-px bg-border mx-2" />

                  <Pressable
                    className="flex-row items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/70"
                    onPress={() => {
                      setShowMenu(false);
                      authClient.signOut();
                      queryClient.invalidateQueries();
                    }}
                  >
                    <Ionicons name="log-out" size={18} color="#ef4444" />
                    <Text className="text-destructive text-sm">Sign Out</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <Button
              accessibilityLabel="Sign in"
              size="sm"
              onPress={() => {
                // TODO: Navigate to sign in screen
              }}
            >
              Sign In
            </Button>
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
