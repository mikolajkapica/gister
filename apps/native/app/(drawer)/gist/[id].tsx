import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Container } from "@/components/container";
import { trpc } from "@/utils/trpc";

export default function GistDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const gist = useQuery({ ...trpc.getGist.queryOptions({ id }), enabled: !!id });

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

	const data = gist.data;

	return (
		<Container>
			<ScrollView className="flex-1">
				<View className="px-4 py-4">
					<Text className="font-bold font-mono mb-4 text-2xl text-foreground">
						{data?.description || "(no description)"}
					</Text>
					<Text className="mb-4 text-muted-foreground text-sm">
						{Object.keys(data?.files || {}).length} file(s) • {data?.public ? "public" : "private"}
					</Text>
					{Object.entries(data?.files || {}).map(([filename, file]) => (
						<View key={filename} className="mb-6">
							<Text className="font-medium mb-2 text-foreground">{filename}</Text>
							<View className="bg-muted p-4 rounded-md">
								<Text className="font-mono text-foreground text-sm">
									{file.content}
								</Text>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</Container>
	);
}