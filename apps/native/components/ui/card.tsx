import type { ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";

export type CardProps = ViewProps & {
  className?: string;
  children?: ReactNode;
};

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <View
      {...props}
      className={
        [
          "border",
          "bg-card",
          "rounded-lg",
          className ?? "",
        ].join(" ").trim()
      }
    >
      {children}
    </View>
  );
};

export const CardHeader = ({
  className,
  children,
  ...props
}: CardProps) => {
  return (
    <View
      {...props}
      className={[
        "p-4",
        className ?? "",
      ].join(" ").trim()}
    >
      {children}
    </View>
  );
};

export const CardContent = ({
  className,
  children,
  ...props
}: CardProps) => {
  return (
    <View
      {...props}
      className={[
        "p-4",
        className ?? "",
      ].join(" ").trim()}
    >
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
      className={
        [
          "font-medium",
          "text-foreground",
          className ?? "",
        ].join(" ").trim()
      }
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
      className={
        [
          "text-muted-foreground",
          "text-sm",
          className ?? "",
        ].join(" ").trim()
      }
    >
      {children}
    </Text>
  );
};