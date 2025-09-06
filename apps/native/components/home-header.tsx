import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Text, TouchableOpacity, View } from "react-native";

import { queryClient, trpc } from "@/utils/trpc";

export function HomeHeader() {
	const { data: session } = authClient.useSession();
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());

	return (
		<View className="flex-row items-center justify-between px-4 py-2">
			{session?.user && (
				<View className="flex-row items-center gap-2">
					<Text className="text-foreground font-medium">
						{session.user.name}
					</Text>
					<TouchableOpacity
						className="bg-destructive px-3 py-1 rounded-md"
						onPress={() => {
							authClient.signOut();
							queryClient.invalidateQueries();
						}}
					>
						<Text className="text-white text-sm font-medium">Sign Out</Text>
					</TouchableOpacity>
				</View>
			)}
			<View className="flex-row items-center gap-2">
				<View
					className={`h-3 w-3 rounded-full ${
						healthCheck.data ? "bg-green-500" : "bg-red-500"
					}`}
				/>
				<Text className="text-muted-foreground text-sm">
					{healthCheck.isLoading ? "Checking..." : healthCheck.data ? "API" : "API"}
				</Text>
			</View>
		</View>
	);
}