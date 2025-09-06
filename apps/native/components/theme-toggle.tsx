import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useColorScheme } from "@/lib/use-color-scheme";

export function ThemeToggle() {
	const { isDarkColorScheme, toggleColorScheme } = useColorScheme();

	return (
		<Pressable
			accessibilityLabel={`Switch to ${isDarkColorScheme ? "light" : "dark"} mode`}
			accessibilityRole="button"
			className="flex-row items-center justify-center rounded-full border border-border/60 bg-card p-2"
			onPress={toggleColorScheme}
		>
			<Ionicons
				color={isDarkColorScheme ? "#fbbf24" : "#1e293b"}
				name={isDarkColorScheme ? "sunny" : "moon"}
				size={20}
			/>
		</Pressable>
	);
}