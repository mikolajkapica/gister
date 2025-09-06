import { Alert, Platform } from "react-native";

const alertPolyfill = (
  title: string,
  description: string,
  options: Array<{
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
  }>
) => {
  const result = window.confirm(
    [title, description].filter(Boolean).join("\n")
  );

  if (result) {
    const confirmOption = options.find(({ style }) => style !== "cancel");
    confirmOption?.onPress?.();
  } else {
    const cancelOption = options.find(({ style }) => style === "cancel");
    cancelOption?.onPress?.();
  }
};

const alert = Platform.OS === "web" ? alertPolyfill : Alert.alert;

export default alert;
