interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
  onAddTask: () => void;
}

export default function Toolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddTask,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-green-primary"
          />
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center glass rounded-lg overflow-hidden">
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 text-sm transition-colors ${
            viewMode === "list"
              ? "bg-green-primary/20 text-green-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
          aria-label="List view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange("kanban")}
          className={`px-3 py-1.5 text-sm transition-colors ${
            viewMode === "kanban"
              ? "bg-green-primary/20 text-green-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
          aria-label="Kanban view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1" />
            <rect x="14" y="3" width="7" height="12" rx="1" />
          </svg>
        </button>
      </div>

      {/* Add Task */}
      <button
        onClick={onAddTask}
        className="px-4 py-2 text-sm font-semibold text-dark-base rounded-lg shrink-0"
        style={{ background: "linear-gradient(135deg, #00D67E, #00B468)" }}
      >
        + Add Task
      </button>
    </div>
  );
}
