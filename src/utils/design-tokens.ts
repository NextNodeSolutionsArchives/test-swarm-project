/** Pulseo Design Tokens — single source of truth for brand values */

export const COLORS = {
  greenPrimary: "#00D67E",
  orangePrimary: "#FF6B35",
  darkBase: "#0A0A0F",
  surface: "rgba(255, 255, 255, 0.05)",
  surfaceHover: "rgba(255, 255, 255, 0.10)",
  border: "rgba(255, 255, 255, 0.12)",
  textPrimary: "#F5F5F7",
  textSecondary: "#8A8A9A",
} as const;

export const FONTS = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export const EASING = {
  entrance: "power3.out",
  scrub: "power2.inOut",
} as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
} as const;
