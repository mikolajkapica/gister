import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Container } from "@/components/container";
import { trpc, trpcClient } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
						<Input
							label="Description"
							value={editedDescription}
							onChangeText={setEditedDescription}
							placeholder="Description"
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
							].join(" ").trim()}
						/>
					) : (
						<Text
							className={[
								"mb-4",
								"font-bold",
								"font-mono",
								"text-2xl",
								"text-foreground",
							].join(" ").trim()}
						>
							{data?.description || "(no description)"}
						</Text>
					)}
					<Text className="mb-4 text-muted-foreground text-sm">
						{Object.keys(data?.files || {}).length} file(s) • {data?.public ? "public" : "private"}
					</Text>
					<Button
						className={["mb-4", "self-start"].join(" ").trim()}
						loading={updateGistMutation.isPending}
						onPress={() => {
							if (isEditing) {
								updateGistMutation.mutate({
									id,
									description: editedDescription,
									files: Object.fromEntries(
										Object.entries(editedFiles).map(([k, v]) => [k, { content: v }]),
									),
								});
							} else {
								setIsEditing(true);
							}
						}}
						accessibilityLabel={isEditing ? "Save gist" : "Edit gist"}
					>
						{isEditing ? "Save" : "Edit"}
					</Button>
					{Object.entries(data?.files || {}).map(([filename, file]) => (
						<View key={filename} className="mb-6">
							<Text
								className={[
									"font-medium",
									"mb-2",
									"text-foreground",
								].join(" ").trim()}
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
									].join(" ").trim()}
									value={editedFiles[filename] || ""}
									onChangeText={(text) =>
										setEditedFiles((prev) => ({ ...prev, [filename]: text }))
									}
									multiline
									textAlignVertical="top"
								/>
							) : (
								<View className={["rounded-md", "bg-muted", "p-4"].join(" ").trim()}>
									<Text
										className={[
											"font-mono",
											"text-foreground",
											"text-sm",
										].join(" ").trim()}
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