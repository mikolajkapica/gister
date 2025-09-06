import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";
import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleEmailLogin = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError: (err) => {
					setError(err.error?.message || "Failed to sign in");
					setIsLoading(false);
				},
				onSuccess: () => {
					setEmail("");
					setPassword("");
					queryClient.refetchQueries();
				},
				onFinished: () => {
					setIsLoading(false);
				},
			},
		);
	};

	const handleGitHubLogin = async () => {
		setIsLoading(true);
		setError(null);
		await authClient.signIn.social(
			{
				provider: "github",
				callbackURL: "/",
			},
			{
				onError: (err) => {
					setError(err.error?.message || "Failed to sign in with GitHub");
					setIsLoading(false);
				},
				onSuccess: () => {
					queryClient.refetchQueries();
				},
				onFinished: () => {
					setIsLoading(false);
				},
			},
		);
	};

	return (
		<View className="mt-6 p-4 bg-card rounded-lg border border-border">
			<Text className="text-lg font-semibold text-foreground mb-4">
				Sign In
			</Text>

			{error && (
				<View className="mb-4 p-3 bg-destructive/10 rounded-md">
					<Text className="text-destructive text-sm">{error}</Text>
				</View>
			)}

			{/* Social login */}
			<TouchableOpacity
				onPress={handleGitHubLogin}
				disabled={isLoading}
				className="bg-black mb-4 p-4 rounded-md flex-row justify-center items-center"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="#fff" />
				) : (
					<Text className="text-white font-medium">Continue with GitHub</Text>
				)}
			</TouchableOpacity>

			{/* Email + password fallback */}
			<TextInput
				className="mb-3 p-4 rounded-md bg-input text-foreground border border-input"
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				placeholderTextColor="#9CA3AF"
				keyboardType="email-address"
				autoCapitalize="none"
			/>

			<TextInput
				className="mb-4 p-4 rounded-md bg-input text-foreground border border-input"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				placeholderTextColor="#9CA3AF"
				secureTextEntry
			/>

			<TouchableOpacity
				onPress={handleEmailLogin}
				disabled={isLoading}
				className="bg-primary p-4 rounded-md flex-row justify-center items-center"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="#fff" />
				) : (
					<Text className="text-primary-foreground font-medium">Sign In</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}
