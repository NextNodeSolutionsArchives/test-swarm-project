import { ClipboardPlus } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  onCreateTask: () => void;
}

export default function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
        <ClipboardPlus size={40} strokeWidth={1.5} className="text-text-secondary" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">No tasks yet</h3>
      <p className="text-text-secondary mb-6 max-w-sm">
        Create your first task to get started
      </p>
      <Button variant="primary" size="md" onClick={onCreateTask}>
        Create First Task
      </Button>
    </div>
  );
}
