import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";
import alert from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          {isEditing ? (
            <Input
              inputClassName={[
                "border",
                "border-border",
                "font-bold",
                "font-mono",
                "mb-4",
                "p-2",
                "rounded-md",
                "text-2xl",
                "text-foreground",
              ]
                .join(" ")
                .trim()}
              label="Description"
              onChangeText={setEditedDescription}
              placeholder="Description"
              value={editedDescription}
            />
          ) : (
            <Text
              className={[
                "mb-4",
                "font-bold",
                "font-mono",
                "text-2xl",
                "text-foreground",
              ]
                .join(" ")
                .trim()}
            >
              {data?.description || "(no description)"}
            </Text>
          )}
          <View className="mb-4 flex-row items-center gap-2">
            <Badge tone="neutral">
              {Object.keys(data?.files || {}).length} file(s)
            </Badge>
            <Badge tone={data?.public ? "success" : "neutral"}>
              {data?.public ? "public" : "private"}
            </Badge>
          </View>
          <View className="mb-4 flex-row gap-2">
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
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
            <Button
              accessibilityLabel="Delete gist"
              className="flex-1 border-destructive"
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
              textClassName="text-destructive"
              variant="outline"
            >
              Delete
            </Button>
          </View>
          {Object.entries(data?.files || {}).map(([filename, file]) => (
            <View className="mb-6" key={filename}>
              <Text
                className={["font-medium", "mb-2", "text-foreground"]
                  .join(" ")
                  .trim()}
              >
                {filename}
              </Text>
              {isEditing ? (
                <TextInput
                  className={[
                    "rounded-md",
                    "bg-muted",
                    "p-4",
                    "font-mono",
                    "text-foreground",
                    "text-sm",
                  ]
                    .join(" ")
                    .trim()}
                  multiline
                  onChangeText={(text) =>
                    setEditedFiles((prev) => ({ ...prev, [filename]: text }))
                  }
                  textAlignVertical="top"
                  value={editedFiles[filename] || ""}
                />
              ) : (
                <View
                  className={["rounded-md", "bg-muted", "p-4"].join(" ").trim()}
                >
                  <Text
                    className={["font-mono", "text-foreground", "text-sm"]
                      .join(" ")
                      .trim()}
                  >
                    {file.content}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}
