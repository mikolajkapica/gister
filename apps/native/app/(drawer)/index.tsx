import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "@/components/ui/search-bar";

export default function Home() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const gists = useQuery({ ...trpc.listGists.queryOptions(), enabled: Boolean(session?.user) });
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
				<View className={["mx-auto", "w-full", "max-w-screen-lg", "px-4", "py-4"].join(" ").trim()}>
					{session?.user && (
						<>
							<View className="mb-6">
								<Text className={["text-foreground", "text-2xl", "font-semibold"].join(" ").trim()}>
									{`Welcome${session?.user?.name ? `, ${session.user.name}` : ""}`}
								</Text>
								<Text className={["mt-1", "text-muted-foreground"].join(" ").trim()}>
									Browse and manage your code gists
								</Text>
							</View>

							<View className="mb-4">
								<SearchBar
									value={query}
									onChangeText={setQuery}
									placeholder="Search by description..."
									accessibilityLabel="Search gists"
								/>
							</View>

							<Card className={["mb-6", "rounded-xl", "shadow-sm"].join(" ").trim()}>
								<CardHeader>
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center gap-2">
											<Ionicons name="folder-outline" size={18} color="#4C6EF5" />
											<CardTitle>Your Gists</CardTitle>
										</View>
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
												<View className="gap-3">
													{[0, 1, 2].map((i) => (
														<View
															key={i}
															className={[
																"h-12",
																"rounded-xl",
																"bg-muted",
																"animate-pulse",
															].join(" ").trim()}
														/>
													))}
												</View>
											);
										}
										if (gists.error) {
											return (
												<Text className="text-destructive">
													Failed to load gists
												</Text>
											);
										}
										if (filtered.length === 0) {
											return (
												<View className="items-center justify-center py-8">
													<Ionicons name="document-text-outline" size={28} color="#94a3b8" />
													<Text className="mt-2 text-muted-foreground">
														No gists found
													</Text>
												</View>
											);
										}
										return (
											<View className="gap-3">
												{filtered.map((g) => {
													const isPublic = Boolean(g.public);
													return (
														<TouchableOpacity
															key={g.id}
															className={[
																"flex-row",
																"items-center",
																"justify-between",
																"rounded-xl",
																"border",
																"border-border/60",
																"bg-card",
																"p-3",
																"shadow-sm",
																"transition-colors",
																"hover:bg-muted/50",
															].join(" ").trim()}
															onPress={() => router.push(`/gist/${g.id}`)}
														>
															<View className="flex-row items-center">
																<View
																	className={[
																		"mr-3",
																		"h-8",
																		"w-8",
																		"items-center",
																		"justify-center",
																		"rounded-lg",
																		"bg-primary/10",
																	].join(" ").trim()}
																>
																	<Ionicons name="document-text-outline" size={18} color="#4C6EF5" />
																</View>
																<View className="max-w-[78%]">
																	<Text
																		className={[
																			"font-medium",
																			"text-foreground",
																		].join(" ").trim()}
																		numberOfLines={1}
																	>
																		{g.description || "(no description)"}
																	</Text>
																	<View className="mt-1 flex-row items-center gap-2">
																		<Text
																			className={[
																				"text-xs",
																				"text-muted-foreground",
																			].join(" ").trim()}
																		>
																			{g.files} file(s)
																		</Text>
																		<Badge tone={isPublic ? "success" : "neutral"}>
																			{isPublic ? "public" : "private"}
																		</Badge>
																	</View>
																</View>
															</View>
															<Ionicons name="chevron-forward" size={18} color="#94a3b8" />
														</TouchableOpacity>
													);
												})}
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
