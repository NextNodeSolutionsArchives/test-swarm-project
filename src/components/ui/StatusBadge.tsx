interface StatusBadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export default function StatusBadge({
  label,
  color,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}
