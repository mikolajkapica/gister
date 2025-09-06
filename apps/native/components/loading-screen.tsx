import { Text, View } from "react-native";

export function LoadingScreen() {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-foreground text-4xl font-bold font-mono">
				Gister
			</Text>
		</View>
	);
}