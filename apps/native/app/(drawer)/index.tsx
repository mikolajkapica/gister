import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { trpc } from "@/utils/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const gists = useQuery({ ...trpc.listGists.queryOptions(), enabled: Boolean(session?.user) });
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
				<View className="px-4">
					{session?.user && (
						<>
							<View className="mb-4">
								<Input
									label="Search gists"
									placeholder="Search by description..."
									value={query}
									onChangeText={setQuery}
									accessibilityLabel="Search gists"
								/>
							</View>

							<Card className="mb-6">
								<CardHeader>
									<View className="flex-row items-center justify-between">
										<CardTitle>Your Gists</CardTitle>
										<Button
											variant="outline"
											onPress={() => gists.refetch()}
											accessibilityLabel="Refresh gists"
										>
											Refresh
										</Button>
									</View>
								</CardHeader>
								<CardContent>
									{(() => {
										if (gists.isLoading) {
											return (
												<Text className="text-muted-foreground">
													Loading gists…
												</Text>
											);
										}
										if (gists.error) {
											return (
												<Text className="text-destructive">
													Failed to load gists
												</Text>
											);
										}
										return (
											<View className="gap-2">
												{filtered.length === 0 ? (
													<Text className="text-muted-foreground">
														No gists found
													</Text>
												) : (
													filtered.map((g) => (
														<TouchableOpacity
															key={g.id}
															className="rounded-md border border-border p-3"
															onPress={() => router.push(`/gist/${g.id}`)}
														>
															<Text className="font-medium text-foreground">
																{g.description || "(no description)"}
															</Text>
															<Text className="text-muted-foreground text-xs">
																{g.files} file(s) • {g.public ? "public" : "private"}
															</Text>
														</TouchableOpacity>
													))
												)}
											</View>
										);
									})()}
								</CardContent>
							</Card>
						</>
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
