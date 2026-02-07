import { useState, useEffect, useRef, type ReactNode } from "react";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export default function DropdownMenu({
  trigger,
  items,
  align = "right",
  className = "",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div onClick={() => setOpen(!open)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpen(!open); }}>
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1 glass rounded-lg py-1 min-w-[140px] z-20`}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-surface-hover ${
                item.danger ? "text-red-400" : "text-text-primary"
              }`}
              role="menuitem"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
