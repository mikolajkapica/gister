import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Container } from "@/components/container";
import { trpc, trpcClient } from "@/utils/trpc";

export default function GistDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const queryClient = useQueryClient();
	const gist = useQuery({ ...trpc.getGist.queryOptions({ id }), enabled: !!id });
	const updateGistMutation = useMutation({
		mutationFn: (input: { id: string; description?: string; files?: Record<string, { content: string }> }) => trpcClient.updateGist.mutate(input),
		onSuccess: () => {
			setIsEditing(false);
			queryClient.invalidateQueries({ queryKey: trpc.getGist.queryOptions({ id }).queryKey });
		}
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
						<TextInput
							className="font-bold font-mono mb-4 text-2xl text-foreground border border-border p-2 rounded-md"
							value={editedDescription}
							onChangeText={setEditedDescription}
							placeholder="Description"
						/>
					) : (
						<Text className="font-bold font-mono mb-4 text-2xl text-foreground">
							{data?.description || "(no description)"}
						</Text>
					)}
					<Text className="mb-4 text-muted-foreground text-sm">
						{Object.keys(data?.files || {}).length} file(s) • {data?.public ? "public" : "private"}
					</Text>
					<TouchableOpacity
						className="bg-primary py-2 px-4 rounded-md self-start mb-4"
						onPress={() => {
							if (isEditing) {
								updateGistMutation.mutate({
									id,
									description: editedDescription,
									files: Object.fromEntries(Object.entries(editedFiles).map(([k, v]) => [k, { content: v }])),
								});
							} else {
								setIsEditing(true);
							}
						}}
						disabled={updateGistMutation.isPending}
					>
						<Text className="text-primary-foreground font-medium">
							{updateGistMutation.isPending ? "Saving..." : (isEditing ? "Save" : "Edit")}
						</Text>
					</TouchableOpacity>
					{Object.entries(data?.files || {}).map(([filename, file]) => (
						<View key={filename} className="mb-6">
							<Text className="font-medium mb-2 text-foreground">{filename}</Text>
							{isEditing ? (
								<TextInput
									className="bg-muted p-4 rounded-md font-mono text-foreground text-sm"
									value={editedFiles[filename] || ""}
									onChangeText={(text) => setEditedFiles(prev => ({ ...prev, [filename]: text }))}
									multiline
									textAlignVertical="top"
								/>
							) : (
								<View className="bg-muted p-4 rounded-md">
									<Text className="font-mono text-foreground text-sm">
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