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
                <Text className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
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
              <Text className="text-2xl font-bold text-foreground mb-4 leading-tight">
                {data?.description || "Untitled Gist"}
              </Text>
            )}

            {/* Metadata Badges */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="flex-row items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                <Text className="text-sm font-medium text-muted-foreground">
                  {Object.keys(data?.files || {}).length}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {Object.keys(data?.files || {}).length === 1 ? "file" : "files"}
                </Text>
              </View>
              <View className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full ${
                data?.public
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
              }`}>
                <View className={`w-2 h-2 rounded-full ${
                  data?.public ? "bg-green-500" : "bg-gray-500"
                }`} />
                <Text className={`text-sm font-medium ${
                  data?.public ? "text-green-700" : "text-gray-700"
                }`}>
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
              className="flex-1 bg-destructive border-0 hover:bg-destructive/90"
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
              variant="outline"
            >
              Delete
            </Button>
          </View>
          {/* Files Section */}
          <View className="space-y-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Files
            </Text>

            {Object.entries(data?.files || {}).map(([filename, file]) => (
              <View
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                key={filename}
              >
                {/* File Header */}
                <View className="flex-row items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-blue-500" />
                    <Text className="font-medium text-foreground text-sm">
                      {filename}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    {file.language || "text"}
                  </Text>
                </View>

                {/* File Content */}
                {isEditing ? (
                  <View className="p-4">
                    <TextInput
                      className="bg-background border border-border rounded-lg p-4 font-mono text-sm text-foreground min-h-[200px]"
                      multiline
                      onChangeText={(text) =>
                        setEditedFiles((prev) => ({ ...prev, [filename]: text }))
                      }
                      placeholder="Enter your code here..."
                      textAlignVertical="top"
                      value={editedFiles[filename] || ""}
                    />
                  </View>
                ) : (
                  <View className="p-4 bg-slate-50 dark:bg-slate-900/50">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <Text className="font-mono text-sm text-foreground whitespace-pre-wrap min-w-full">
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
