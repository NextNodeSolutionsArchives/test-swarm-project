interface AvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-[0.7rem]",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export default function Avatar({ username, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white tracking-wide ${SIZE_CLASSES[size]} ${className}`}
      style={{
        background: "linear-gradient(135deg, var(--color-green-primary), var(--color-orange-primary))",
      }}
      aria-label={username}
    >
      {getInitials(username)}
    </span>
  );
}
