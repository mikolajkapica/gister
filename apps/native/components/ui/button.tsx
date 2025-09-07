import type { ReactNode } from "react";
import type { GestureResponderEvent, PressableProps } from "react-native";
import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant = "primary" | "outline" | "ghost" | "destructive";
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
  destructive: "bg-destructive border border-destructive active:opacity-90",
};

const textVariantClasses: Record<Variant, string> = {
  primary: "text-primary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
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
    content = <ActivityIndicator color="#ffffff" size="small" />;
  } else if (typeof children === "string") {
    content = (
      <Text
        className={[
          "font-medium",
          textSizeClasses[size],
          textVariantClasses[variant],
          textClassName ?? "",
        ]
          .join(" ")
          .trim()}
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
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
      className={[
        "flex-row items-center justify-center",
        sizeClasses[size],
        variantBaseClasses[variant],
        isDisabled ? "opacity-60" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
    >
      {content}
    </Pressable>
  );
};
