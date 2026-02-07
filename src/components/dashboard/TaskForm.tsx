import { useState, useRef, useEffect } from "react";
import type { Column } from "@/lib/types";

interface TaskFormProps {
  columns: Column[];
  initialTitle?: string;
  initialDescription?: string;
  initialStatus?: string;
  onSave: (data: { title: string; description?: string; status: string }) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function TaskForm({
  columns,
  initialTitle = "",
  initialDescription = "",
  initialStatus,
  onSave,
  onCancel,
  submitLabel = "Save",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus || columns[0]?.statusValue || "");
  const [showDescription, setShowDescription] = useState(!!initialDescription);
  const [titleError, setTitleError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required");
      return;
    }
    if (trimmedTitle.length > 200) {
      setTitleError("Title must be 200 characters or less");
      return;
    }
    setTitleError("");
    onSave({
      title: trimmedTitle,
      description: description.trim() || undefined,
      status,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="glass p-4 space-y-3" onKeyDown={handleKeyDown}>
      <div>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError("");
          }}
          placeholder="Task title..."
          className={`w-full bg-transparent border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 ${
            titleError
              ? "border-red-500 focus:ring-red-500"
              : "border-border focus:ring-green-primary"
          }`}
          maxLength={200}
        />
        {titleError && (
          <p className="text-red-500 text-xs mt-1">{titleError}</p>
        )}
      </div>

      {showDescription ? (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)..."
          className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-green-primary resize-y min-h-[60px]"
          maxLength={2000}
          rows={3}
        />
      ) : (
        <button
          onClick={() => setShowDescription(true)}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          + Add description
        </button>
      )}

      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-green-primary"
        >
          {columns.map((col) => (
            <option key={col.id} value={col.statusValue}>
              {col.name}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg border border-border hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 text-sm font-semibold text-dark-base rounded-lg"
          style={{ background: "linear-gradient(135deg, #00D67E, #00B468)" }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
