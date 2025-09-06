import type { ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";

export type BadgeProps = ViewProps & {
  children?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error" | "info";
  className?: string;
  textClassName?: string;
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, { container: string; text: string }> = {
  neutral: { container: "bg-secondary", text: "text-secondary-foreground" },
  success: { container: "bg-green-100", text: "text-green-700" },
  warning: { container: "bg-yellow-100", text: "text-yellow-800" },
  error: { container: "bg-red-100", text: "text-red-700" },
  info: { container: "bg-accent", text: "text-accent-foreground" },
};

export const Badge = ({ children, tone = "neutral", className, textClassName, ...props }: BadgeProps) => {
  const t = toneClasses[tone];

  return (
    <View
      {...props}
      accessibilityRole="text"
      className={
        [
          "px-2",
          "h-6",
          "items-center",
          "justify-center",
          "rounded-full",
          t.container,
          className ?? "",
        ].join(" ").trim()
      }
    >
      <Text
        className={
          [
            "text-xs",
            "font-medium",
            t.text,
            textClassName ?? "",
          ].join(" ").trim()
        }
      >
        {children}
      </Text>
    </View>
  );
};