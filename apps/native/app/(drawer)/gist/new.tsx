import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc, trpcClient } from "@/utils/trpc";

export default function CreateGist() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<
    Array<{ id: string; name: string; content: string }>
  >([{ id: "file-0", name: "", content: "" }]);
  const [isPublic, setIsPublic] = useState(false);

  const createGistMutation = useMutation({
    mutationFn: (input: {
      description?: string;
      files: Record<string, { content: string }>;
      public: boolean;
    }) => trpcClient.createGist.mutate(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: trpc.listGists.queryOptions().queryKey,
      });
      router.replace(`/gist/${data.id}`);
    },
  });

  const addFile = () => {
    const newId = `file-${Date.now()}`;
    const newFileName = `file${files.length + 1}.txt`;
    setFiles((prev) => [
      ...prev,
      { id: newId, name: newFileName, content: "" },
    ]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const updateFileName = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, name: newName } : file))
    );
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, content } : file))
    );
  };

  const handleSubmit = () => {
    // Filter out empty files and format for API
    const validFiles = files
      .filter((file) => file.name.trim() && file.content.trim())
      .reduce(
        (acc, file) => {
          acc[file.name] = { content: file.content };
          return acc;
        },
        {} as Record<string, { content: string }>
      );

    if (Object.keys(validFiles).length === 0) {
      alert("Please add at least one file with content.");
      return;
    }

    createGistMutation.mutate({
      description: description.trim() || undefined,
      files: validFiles,
      public: isPublic,
    });
  };

  return (
    <Container>
      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          <View className="mb-6 flex-row items-center gap-2">
            <View className="flex-1">
              <Text className="font-bold text-2xl text-foreground">
                Create New Gist
              </Text>
              <Text className="text-muted-foreground">
                Add your code files and create a new GitHub gist
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Input
              inputClassName="mb-4"
              label="Description (optional)"
              onChangeText={setDescription}
              placeholder="Brief description of your gist..."
              value={description}
            />

            <View className="mb-4 flex-row items-center gap-2">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => setIsPublic(!isPublic)}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded border-2 ${
                    isPublic
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {isPublic && (
                    <Ionicons color="white" name="checkmark" size={16} />
                  )}
                </View>
                <Text className="text-foreground">Public</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-semibold text-foreground text-lg">
                Files
              </Text>
              <Button onPress={addFile} size="sm" variant="outline">
                <Ionicons color="#4C6EF5" name="add" size={16} />
              </Button>
            </View>

            {files.map((file) => (
              <View
                className="mb-4 rounded-lg border border-border p-4"
                key={file.id}
              >
                <View className="mb-3 flex-row items-center gap-2">
                  <Input
                    className="flex-1"
                    inputClassName="text-sm"
                    onChangeText={(newName) => updateFileName(file.id, newName)}
                    placeholder="filename.txt"
                    value={file.name}
                  />
                  {files.length > 1 && (
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => removeFile(file.id)}
                    >
                      <Ionicons
                        color="#ef4444"
                        name="trash-outline"
                        size={20}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  className="min-h-[120px] rounded-md bg-muted p-3 font-mono text-foreground text-sm"
                  multiline
                  onChangeText={(newContent) =>
                    updateFileContent(file.id, newContent)
                  }
                  placeholder="Enter your code here..."
                  textAlignVertical="top"
                  value={file.content}
                />
              </View>
            ))}
          </View>

          <View className="flex-row gap-2">
            <Button
              className="flex-1"
              loading={createGistMutation.isPending}
              onPress={handleSubmit}
            >
              Create Gist
            </Button>
            <Button
              className="flex-1"
              onPress={() => router.back()}
              variant="outline"
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
