import { useState, useRef, useEffect } from "react";
import type { Column } from "@/lib/types";
import Card from "@/components/ui/Card";
import Input, { Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
    <Card padding="sm" className="space-y-3" onKeyDown={handleKeyDown}>
      <Input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (titleError) setTitleError("");
        }}
        placeholder="Task title..."
        error={titleError}
        maxLength={200}
      />

      {showDescription ? (
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)..."
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

        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </Card>
  );
}
