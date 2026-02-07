import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  className?: string;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

const VARIANT_STYLES: Record<ButtonVariant, { className: string; style?: React.CSSProperties }> = {
  primary: {
    className: "font-semibold text-dark-base",
    style: {
      background: "var(--color-green-primary)",
      boxShadow: "0 0 30px rgba(0, 214, 126, 0.3)",
    },
  },
  secondary: {
    className:
      "font-medium text-text-secondary hover:text-text-primary border border-border hover:bg-surface-hover bg-transparent",
  },
  icon: {
    className: "p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg bg-transparent",
  },
};

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props;

  const variantConfig = VARIANT_STYLES[variant];
  const sizeClass = variant === "icon" ? "" : SIZE_CLASSES[size];
  const classes =
    `inline-flex items-center justify-center gap-2 transition-all duration-200 ${variantConfig.className} ${sizeClass} ${className}`.trim();

  if (props.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <a href={href} className={classes} style={variantConfig.style} {...anchorRest}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonRest.type ?? "button"}
      className={classes}
      style={variantConfig.style}
      {...buttonRest}
    >
      {children}
    </button>
  );
}
