import { Search, List, LayoutGrid, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          icon={<Search size={16} />}
          className="bg-surface"
        />
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
          <List size={16} />
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
          <LayoutGrid size={16} />
        </button>
      </div>

      {/* Add Task */}
      <Button variant="primary" size="sm" onClick={onAddTask} className="shrink-0">
        <Plus size={16} />
        Add Task
      </Button>
    </div>
  );
}
