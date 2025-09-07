import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const gists = useQuery({
    ...trpc.listGists.queryOptions(),
    enabled: Boolean(session?.user),
  });
  const health = useQuery(trpc.healthCheck.queryOptions());
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const list = gists.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((g) => (g.description ?? "").toLowerCase().includes(q));
  }, [gists.data, query]);

  return (
    <Container>
      <ScrollView className="flex-1">
        <View
          className={["mx-auto", "w-full", "max-w-screen-lg", "px-4", "py-4"]
            .join(" ")
            .trim()}
        >
          {session?.user && (
            <>
              <View className="mb-6">
                <Text
                  className={["text-foreground", "text-2xl", "font-semibold"]
                    .join(" ")
                    .trim()}
                >
                  {`Welcome${session?.user?.name ? `, ${session.user.name}` : ""}`}
                </Text>
                <Text
                  className={["mt-1", "text-muted-foreground"].join(" ").trim()}
                >
                  Browse and manage your code gists
                </Text>
              </View>

              <View className="mb-4">
                <SearchBar
                  accessibilityLabel="Search gists"
                  onChangeText={setQuery}
                  placeholder="Search by description..."
                  value={query}
                />
              </View>

              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      color="#4C6EF5"
                      name="folder-outline"
                      size={18}
                    />
                    <Text className="text-lg font-semibold text-foreground">
                      Your Gists
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      accessibilityLabel="Create new gist"
                      onPress={() => router.push("/gist/new")}
                      size="sm"
                    >
                      <Ionicons name="add" size={16} color="#ffffff" />
                    </Button>
                    <Button
                      accessibilityLabel="Refresh gists"
                      onPress={() => gists.refetch()}
                      variant="outline"
                      size="sm"
                    >
                      Refresh
                    </Button>
                  </View>
                </View>

                {(() => {
                  if (gists.isLoading) {
                    return (
                      <View className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <View
                            className="h-16 bg-muted animate-pulse rounded-lg"
                            key={i}
                          />
                        ))}
                      </View>
                    );
                  }
                  if (gists.error) {
                    return (
                      <Text className="text-destructive py-4">
                        Failed to load gists
                      </Text>
                    );
                  }
                  if (filtered.length === 0) {
                    return (
                      <View className="items-center justify-center py-12">
                        <Ionicons
                          color="#94a3b8"
                          name="document-text-outline"
                          size={32}
                        />
                        <Text className="mt-3 text-muted-foreground text-center">
                          No gists found
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View className="bg-card rounded-xl border border-border overflow-hidden">
                      {filtered.map((g, index) => {
                        const isPublic = Boolean(g.public);
                        const isLast = index === filtered.length - 1;

                        return (
                          <View key={g.id}>
                            <TouchableOpacity
                              className="flex-row items-center justify-between p-4 active:bg-muted/50"
                              onPress={() => router.push(`/gist/${g.id}`)}
                            >
                              <View className="flex-row items-center flex-1">
                                <View className="mr-4 h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <Ionicons
                                    color="#4C6EF5"
                                    name="document-text-outline"
                                    size={20}
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text
                                    className="font-medium text-foreground text-base"
                                    numberOfLines={1}
                                  >
                                    {g.description || "(no description)"}
                                  </Text>
                                  <View className="mt-1 flex-row items-center gap-2">
                                    <Text className="text-xs text-muted-foreground">
                                      {g.files} file{g.files !== 1 ? "s" : ""}
                                    </Text>
                                    <Badge tone={isPublic ? "success" : "neutral"}>
                                      {isPublic ? "public" : "private"}
                                    </Badge>
                                  </View>
                                </View>
                              </View>
                              <Ionicons
                                color="#94a3b8"
                                name="chevron-forward"
                                size={18}
                              />
                            </TouchableOpacity>
                            {!isLast && (
                              <View className="h-px bg-border mx-4" />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            </>
          )}

          {!session?.user && (
            <View className="flex-1 justify-center items-center px-6 py-12">
              {/* App Logo/Icon */}
              <View className="mb-8 items-center">
                <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-4">
                  <Ionicons name="code-slash" size={32} color="#4C6EF5" />
                </View>
                <Text className="text-3xl font-bold text-foreground text-center mb-2">
                  Gister
                </Text>
                <Text className="text-muted-foreground text-center text-base">
                  Code snippets made simple
                </Text>
              </View>

              {/* Login Card */}
              <View className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 shadow-lg">
                <Text className="text-xl font-semibold text-foreground text-center mb-2">
                  Welcome to Gister
                </Text>
                <Text className="text-muted-foreground text-center mb-8 text-sm">
                  Sign in with GitHub to get started
                </Text>

                {/* GitHub Login Button */}
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await authClient.signIn.social(
                        {
                          provider: "github",
                          callbackURL: "/",
                        },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries();
                          },
                        }
                      );
                    } catch (error) {
                      // Handle login error silently for better UX
                    }
                  }}
                  className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 p-4 rounded-2xl flex-row items-center justify-center gap-3 mb-6"
                >
                  <Ionicons name="logo-github" size={20} color="#ffffff" />
                  <Text className="text-white font-semibold text-base">
                    Continue with GitHub
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <Text className="text-muted-foreground text-center text-xs">
                  By signing in, you agree to our terms of service
                </Text>
              </View>

              {/* Bottom spacing */}
              <View className="flex-1" />
            </View>
          )}
          {/* Footer: API status */}
          <View className="my-6 items-center">
            <View className="flex-row items-center gap-2">
              <View
                className={`h-2.5 w-2.5 rounded-full ${
                  health.data ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text className="text-muted-foreground text-xs">
                {(() => {
                  if (health.isLoading) {
                    return "Checking API…";
                  }
                  if (health.data) {
                    return "API OK";
                  }
                  return "API DOWN";
                })()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
