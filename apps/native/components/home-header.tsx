import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

import { queryClient, trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";

export function HomeHeader() {
	const { data: session } = authClient.useSession();
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());

	return (
		<View className="flex-row items-center justify-between px-4 py-2">
			{session?.user && (
				<View className="flex-row items-center gap-2">
					<Text
						className={[
							"font-medium",
							"text-foreground",
						].join(" ").trim()}
					>
						{session.user.name}
					</Text>
					<Button
						variant="primary"
						className="rounded-md border-destructive bg-destructive px-3 py-1"
						accessibilityLabel="Sign out"
						onPress={() => {
							authClient.signOut();
							queryClient.invalidateQueries();
						}}
						textClassName="font-medium text-primary-foreground text-sm"
					>
						Sign Out
					</Button>
				</View>
			)}
			<View className="flex-row items-center gap-2">
				<View
					className={`h-3 w-3 rounded-full ${
						healthCheck.data ? "bg-green-500" : "bg-red-500"
					}`}
				/>
				<Text className="text-muted-foreground text-sm">
					{(() => {
						if (healthCheck.isLoading) {
							return "Checking...";
						}
						if (healthCheck.data) {
							return "API OK";
						}
						return "API DOWN";
					})()}
				</Text>
			</View>
		</View>
	);
}