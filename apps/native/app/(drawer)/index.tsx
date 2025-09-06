import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { trpc } from "@/utils/trpc";

export default function Home() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const gists = useQuery({ ...trpc.listGists.queryOptions(), enabled: Boolean(session?.user) });

	return (
		<Container>
			<ScrollView className="flex-1">
				<View className="px-4">
					{session?.user && (
						<View className="mb-6 rounded-lg border border-border p-4">
							<Text className="mb-3 font-medium text-foreground">
								Your Gists
							</Text>
							{gists.isLoading ? (
								<Text className="text-muted-foreground">Loading gists…</Text>
							) : gists.error ? (
								<Text className="text-destructive">
									Failed to load gists
								</Text>
							) : (
								<View className="gap-2">
									{(gists.data ?? []).length === 0 ? (
										<Text className="text-muted-foreground">No gists found</Text>
									) : (
										(gists.data ?? []).map((g) => (
											<TouchableOpacity
												key={g.id}
												className="border border-border rounded-md p-3"
												onPress={() => router.push(`/gist/${g.id}`)}
											>
												<Text className="text-foreground font-medium">
													{g.description || "(no description)"}
												</Text>
												<Text className="text-muted-foreground text-xs">
													{g.files} file(s) • {g.public ? "public" : "private"}
												</Text>
											</TouchableOpacity>
										))
									)}
								</View>
							)}
						</View>
					)}

					{!session?.user && (
						<>
							<SignIn />
							<SignUp />
						</>
					)}
				</View>
			</ScrollView>
		</Container>
	);
}
