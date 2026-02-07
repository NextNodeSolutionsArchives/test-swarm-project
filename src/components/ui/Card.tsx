import type { HTMLAttributes, ReactNode } from "react";

type CardPadding = "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  borderColor?: string;
  children?: ReactNode;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-12",
};

export default function Card({
  padding = "md",
  borderColor,
  className = "",
  children,
  style,
  ...rest
}: CardProps) {
  const classes = `glass ${PADDING_CLASSES[padding]} ${className}`.trim();
  const combinedStyle = borderColor
    ? { borderColor, ...((style as object) || {}) }
    : style;

  return (
    <div className={classes} style={combinedStyle} {...rest}>
      {children}
    </div>
  );
}
