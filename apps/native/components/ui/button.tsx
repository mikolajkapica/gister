import { ActivityIndicator, Pressable, Text } from "react-native";
import type { GestureResponderEvent, PressableProps } from "react-native";
import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "onPress"> & {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  className?: string;
  textClassName?: string;
};

const variantBaseClasses: Record<Variant, string> = {
  primary: "bg-primary border border-primary active:opacity-90",
  outline: "bg-transparent border border-border",
  ghost: "bg-transparent border border-transparent",
};

const textVariantClasses: Record<Variant, string> = {
  primary: "text-primary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-3 rounded-md",
  md: "h-12 px-4 rounded-lg",
  lg: "h-14 px-5 rounded-xl",
};

const textSizeClasses: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onPress,
  accessibilityLabel,
  className,
  textClassName,
  ...pressableProps
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  let content: ReactNode;
  if (loading) {
    content = <ActivityIndicator size="small" color="#ffffff" />;
  } else if (typeof children === "string") {
    content = (
      <Text
        className={[
          "font-medium",
          textSizeClasses[size],
          textVariantClasses[variant],
          textClassName ?? "",
        ].join(" ").trim()}
      >
        {children}
      </Text>
    );
  } else {
    content = children;
  }

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      className={[
        "flex-row items-center justify-center",
        sizeClasses[size],
        variantBaseClasses[variant],
        isDisabled ? "opacity-60" : "",
        className ?? "",
      ].join(" ").trim()}
      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
    >
      {content}
    </Pressable>
  );
};