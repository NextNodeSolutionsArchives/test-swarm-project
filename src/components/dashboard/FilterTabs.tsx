import type { Column } from "@/lib/types";

interface FilterTabsProps {
  columns: Column[];
  activeFilter: string | null;
  onFilterChange: (status: string | null) => void;
}

export default function FilterTabs({ columns, activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
          activeFilter === null
            ? "bg-green-primary/20 text-green-primary font-medium"
            : "text-text-secondary hover:text-text-primary hover:bg-surface"
        }`}
      >
        All
      </button>
      {columns.map((col) => (
        <button
          key={col.id}
          onClick={() => onFilterChange(col.statusValue)}
          className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === col.statusValue
              ? "font-medium"
              : "text-text-secondary hover:text-text-primary hover:bg-surface"
          }`}
          style={
            activeFilter === col.statusValue
              ? { backgroundColor: `${col.color}20`, color: col.color || undefined }
              : undefined
          }
        >
          {col.name}
        </button>
      ))}
    </div>
  );
}
