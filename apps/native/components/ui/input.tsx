import { Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

export type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
};

export const Input = ({
  label,
  helperText,
  errorText,
  containerClassName,
  inputClassName,
  labelClassName,
  helperClassName,
  editable,
  ...props
}: InputProps) => {
  const isError = Boolean(errorText);
  const isDisabled = editable === false;

  return (
    <View
      className={[
        "w-full",
        containerClassName ?? "",
      ].join(" ").trim()}
    >
      {label ? (
        <Text
          className={
            [
              "mb-1",
              "text-sm",
              "font-medium",
              "text-foreground",
              labelClassName ?? "",
            ].join(" ").trim()
          }
          accessibilityLabel={label}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        {...props}
        editable={editable}
        placeholderTextColor="#6b7280"
        className={
          [
            "px-3",
            "h-12",
            "border",
            "rounded-lg",
            "bg-background",
            "text-foreground",
            isError ? "border-destructive" : "border-input",
            isDisabled ? "opacity-60" : "",
            inputClassName ?? "",
          ].join(" ").trim()
        }
        accessibilityHint={isError ? "Input has an error" : props.accessibilityHint}
      />

      {/* Avoid nested ternary: render messages with simple conditionals */}
      {isError ? (
        <Text
          className={[
            // Sort classes (alphabetical)
            "mt-1 text-destructive text-xs",
            helperClassName ?? "",
          ].join(" ").trim()}
        >
          {errorText}
        </Text>
      ) : null}

      {!isError && helperText ? (
        <Text
          className={[
            // Sort classes (alphabetical)
            "mt-1 text-muted-foreground text-xs",
            helperClassName ?? "",
          ].join(" ").trim()}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};