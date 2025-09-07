import type { ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";

export type CardProps = ViewProps & {
  className?: string;
  children?: ReactNode;
  variant?: "outline" | "elevated";
};

export const Card = ({
  className,
  children,
  variant = "outline",
  ...props
}: CardProps) => {
  return (
    <View
      {...props}
      className={[
        ...(variant === "elevated"
          ? ["bg-card", "rounded-lg", "shadow-sm"]
          : [
              "border",
              "border-border/20",
              "bg-card",
              "rounded-lg",
              "shadow-sm",
            ]),
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </View>
  );
};

export const CardHeader = ({ className, children, ...props }: CardProps) => {
  return (
    <View {...props} className={["p-4", className ?? ""].join(" ").trim()}>
      {children}
    </View>
  );
};

export const CardContent = ({ className, children, ...props }: CardProps) => {
  return (
    <View {...props} className={["p-4", className ?? ""].join(" ").trim()}>
      {children}
    </View>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <Text
      className={["font-medium", "text-foreground", className ?? ""]
        .join(" ")
        .trim()}
    >
      {children}
    </Text>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <Text
      className={["text-muted-foreground", "text-sm", className ?? ""]
        .join(" ")
        .trim()}
    >
      {children}
    </Text>
  );
};
