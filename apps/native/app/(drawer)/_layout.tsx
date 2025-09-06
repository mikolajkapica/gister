import { Stack } from "expo-router";

import { HomeHeader } from "@/components/home-header";

const StackLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerTitle: () => <HomeHeader />,
				}}
			/>
			<Stack.Screen
				name="(tabs)"
				options={{
					headerTitle: "Tabs",
				}}
			/>
			<Stack.Screen
				name="gist/[id]"
				options={{
					headerTitle: "Gist",
				}}
			/>
		</Stack>
	);
};

export default StackLayout;
