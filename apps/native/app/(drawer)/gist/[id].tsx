import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc, trpcClient } from "@/utils/trpc";

export default function GistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const gist = useQuery({
    ...trpc.getGist.queryOptions({ id }),
    enabled: !!id,
  });
  const updateGistMutation = useMutation({
    mutationFn: (input: {
      id: string;
      description?: string;
      files?: Record<string, { content: string }>;
    }) => trpcClient.updateGist.mutate(input),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: trpc.getGist.queryOptions({ id }).queryKey,
      });
    },
  });
  const deleteGistMutation = useMutation({
    mutationFn: (input: { id: string }) => trpcClient.deleteGist.mutate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.listGists.queryOptions().queryKey,
      });
      // Try to go back, but if there's no screen to go back to, navigate to the list
      try {
        router.back();
      } catch {
        // If back fails, navigate to the main list
        router.replace("/");
      }
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedFiles, setEditedFiles] = useState<Record<string, string>>({});

  const data = gist.data;

  useEffect(() => {
    if (data) {
      setEditedDescription(data.description || "");
      const files: Record<string, string> = {};
      for (const [filename, file] of Object.entries(data.files)) {
        files[filename] = file.content;
      }
      setEditedFiles(files);
    }
  }, [data]);

  if (!id) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-destructive">Invalid gist ID</Text>
        </View>
      </Container>
    );
  }

  if (gist.isLoading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Loading gist...</Text>
        </View>
      </Container>
    );
  }

  if (gist.error) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-destructive">Failed to load gist</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView className="flex-1 bg-background">
        <View className="px-6 py-6">
          {/* Header Section */}
          <View className="mb-8">
            {isEditing ? (
              <View className="mb-4">
                <Text className="mb-2 font-medium text-muted-foreground text-sm uppercase tracking-wide">
                  Description
                </Text>
                <Input
                  inputClassName="border-0 bg-muted/50 p-4 text-xl font-semibold text-foreground rounded-xl"
                  onChangeText={setEditedDescription}
                  placeholder="Add a description..."
                  value={editedDescription}
                />
              </View>
            ) : (
              <Text className="mb-4 font-bold text-2xl text-foreground leading-tight">
                {data?.description || "Untitled Gist"}
              </Text>
            )}

            {/* Metadata Badges */}
            <View className="mb-6 flex-row items-center gap-3">
              <View className="flex-row items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5">
                <Text className="font-medium text-muted-foreground text-sm">
                  {Object.keys(data?.files || {}).length}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {Object.keys(data?.files || {}).length === 1
                    ? "file"
                    : "files"}
                </Text>
              </View>
              <View
                className={`flex-row items-center gap-2 rounded-full px-3 py-1.5 ${
                  data?.public
                    ? "border border-green-200 bg-green-50"
                    : "border border-gray-200 bg-gray-50"
                }`}
              >
                <View
                  className={`h-2 w-2 rounded-full ${
                    data?.public ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
                <Text
                  className={`font-medium text-sm ${
                    data?.public ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {data?.public ? "Public" : "Private"}
                </Text>
              </View>
            </View>
          </View>
          <View className="mb-6 flex-row gap-3">
            <Button
              accessibilityLabel={isEditing ? "Save gist" : "Edit gist"}
              className="flex-1"
              loading={updateGistMutation.isPending}
              onPress={() => {
                if (isEditing) {
                  updateGistMutation.mutate({
                    id,
                    description: editedDescription,
                    files: Object.fromEntries(
                      Object.entries(editedFiles).map(([k, v]) => [
                        k,
                        { content: v },
                      ])
                    ),
                  });
                } else {
                  setIsEditing(true);
                }
              }}
              size="sm"
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
            <Button
              accessibilityLabel="Delete gist"
              className="flex-1 hover:bg-destructive/90"
              loading={deleteGistMutation.isPending}
              onPress={() => {
                alert(
                  "Delete Gist",
                  "Are you sure you want to delete this gist? This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        deleteGistMutation.mutate({ id });
                      },
                    },
                  ]
                );
              }}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          </View>
          {/* Files Section */}
          <View className="space-y-6">
            <Text className="mb-4 font-semibold text-foreground text-lg">
              Files
            </Text>

            {Object.entries(data?.files || {}).map(([filename, file]) => (
              <View
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                key={filename}
              >
                {/* File Header */}
                <View className="flex-row items-center justify-between border-border/50 border-b bg-muted/30 px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <View className="h-2 w-2 rounded-full bg-blue-500" />
                    <Text className="font-medium text-foreground text-sm">
                      {filename}
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-xs">
                    {file.language || "text"}
                  </Text>
                </View>

                {/* File Content */}
                {isEditing ? (
                  <View className="p-4">
                    <TextInput
                      className="min-h-[200px] rounded-lg border border-border bg-background p-4 font-mono text-foreground text-sm"
                      multiline
                      onChangeText={(text) =>
                        setEditedFiles((prev) => ({
                          ...prev,
                          [filename]: text,
                        }))
                      }
                      placeholder="Enter your code here..."
                      textAlignVertical="top"
                      value={editedFiles[filename] || ""}
                    />
                  </View>
                ) : (
                  <View className="bg-slate-50 p-4 dark:bg-slate-900/50">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text className="min-w-full whitespace-pre-wrap font-mono text-foreground text-sm">
                        {file.content || "// Empty file"}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
