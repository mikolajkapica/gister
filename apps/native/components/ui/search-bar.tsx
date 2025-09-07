import { Ionicons } from "@expo/vector-icons";
import type { TextInputProps } from "react-native";
import { TextInput, View } from "react-native";

export type SearchBarProps = Omit<TextInputProps, "style"> & {
  containerClassName?: string;
  inputClassName?: string;
};

export const SearchBar = ({
  containerClassName,
  inputClassName,
  placeholderTextColor = "#94a3b8",
  ...props
}: SearchBarProps) => {
  return (
    <View
      accessibilityRole="search"
      className={[
        "flex-row",
        "items-center",
        "h-12",
        "rounded-full",
        "border",
        "border-input",
        "bg-background",
        "px-3",
        "shadow-xs",
        containerClassName ?? "",
      ]
        .join(" ")
        .trim()}
    >
      <Ionicons color="#94a3b8" name="search" size={18} />
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? "Search"}
        autoCapitalize={props.autoCapitalize ?? "none"}
        autoCorrect={props.autoCorrect ?? false}
        className={["ml-2", "flex-1", "text-foreground", inputClassName ?? ""]
          .join(" ")
          .trim()}
        clearButtonMode={props.clearButtonMode ?? "while-editing"}
        placeholderTextColor={placeholderTextColor}
      />
    </View>
  );
};
