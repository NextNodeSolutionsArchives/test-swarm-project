import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LogOut } from "lucide-react";
import type { Task, Column } from "@/lib/types";
import {
  fetchTasks,
  fetchColumns,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  restoreTaskApi,
} from "@/lib/api-client";
import { logout } from "@/lib/auth/client";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Toolbar from "./Toolbar";
import FilterTabs from "./FilterTabs";
import TaskForm from "./TaskForm";
import SortableListView from "./SortableListView";
import EmptyState from "./EmptyState";
import Toast, { type ToastItem } from "./Toast";
import KanbanBoard from "./KanbanBoard";

interface DashboardAppProps {
  username?: string;
}

function getInitialViewMode(): "list" | "kanban" {
  const params = new URLSearchParams(window.location.search);
  const urlView = params.get("view");
  if (urlView === "list" || urlView === "kanban") return urlView;

  const stored = localStorage.getItem("dashboard-view-mode");
  if (stored === "list" || stored === "kanban") return stored;

  return "list";
}

function getInitialFilter(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("status") || null;
}

export default function DashboardApp({ username }: DashboardAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban">(getInitialViewMode);
  const [activeFilter, setActiveFilter] = useState<string | null>(getInitialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [tasksRes, colsRes] = await Promise.all([fetchTasks(), fetchColumns()]);
      setTasks(tasksRes.tasks);
      setColumns(colsRes.columns);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleViewModeChange(mode: "list" | "kanban") {
    setViewMode(mode);
    localStorage.setItem("dashboard-view-mode", mode);
    const url = new URL(window.location.href);
    url.searchParams.set("view", mode);
    window.history.replaceState({}, "", url.toString());
  }

  function handleFilterChange(status: string | null) {
    setActiveFilter(status);
    const url = new URL(window.location.href);
    if (status) {
      url.searchParams.set("status", status);
    } else {
      url.searchParams.delete("status");
    }
    window.history.replaceState({}, "", url.toString());
  }

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (activeFilter) {
      result = result.filter((t) => t.status === activeFilter);
    }
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }
    return result;
  }, [tasks, activeFilter, debouncedSearch]);

  async function handleCreate(data: { title: string; description?: string; status: string }) {
    try {
      const { task } = await createTaskApi(data);
      setTasks((prev) => [...prev, task]);
      setIsCreating(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleUpdate(id: string, data: { title: string; description?: string; status: string }) {
    try {
      const { task } = await updateTaskApi(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));

      const toastId = `delete-${id}-${Date.now()}`;
      setToasts((prev) => [
        ...prev,
        {
          id: toastId,
          message: "Task deleted",
          onUndo: async () => {
            try {
              const { task } = await restoreTaskApi(id);
              setTasks((prev) => [...prev, task].sort((a, b) => a.position - b.position));
            } catch {
              // may be permanently deleted
            }
          },
        },
      ]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/auth";
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  const showEmptyState = !isCreating && tasks.length === 0 && !debouncedSearch && !activeFilter;

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Dashboard Header Bar */}
      <header className="dashboard-header">
        <div className="container-content dashboard-header-inner">
          <a href="/" className="dashboard-header-logo">Pulseo</a>
          <div className="dashboard-header-user">
            {username && <span className="dashboard-header-username">{username}</span>}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="text-xs gap-1.5"
            >
              <LogOut size={14} />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="container-content py-8 space-y-6">
        <h1 className="text-heading">Dashboard</h1>

        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onAddTask={() => setIsCreating(true)}
        />

        <FilterTabs
          columns={columns}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {error && (
          <div className="glass p-3 border-red-500/30 text-red-400 text-sm">{error}</div>
        )}

        {isCreating && (
          <TaskForm
            columns={columns}
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
            submitLabel="Create"
          />
        )}

        {showEmptyState ? (
          <EmptyState onCreateTask={() => setIsCreating(true)} />
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            columns={columns}
            onCreateTask={handleCreate}
            onUpdateTask={handleUpdate}
            onDeleteTask={handleDelete}
            onColumnsChange={setColumns}
            onTasksChange={setTasks}
          />
        ) : (
          <>
            <SortableListView
              tasks={filteredTasks}
              columns={columns}
              onUpdateTask={handleUpdate}
              onDeleteTask={handleDelete}
              onTasksChange={setTasks}
            />
            {filteredTasks.length === 0 && (debouncedSearch || activeFilter) && (
              <div className="text-center py-12 text-text-secondary">
                No tasks match your search or filter.
              </div>
            )}
          </>
        )}
      </div>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
