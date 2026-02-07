interface EmptyStateProps {
  onCreateTask: () => void;
}

export default function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-secondary"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">No tasks yet</h3>
      <p className="text-text-secondary mb-6 max-w-sm">
        Create your first task to get started
      </p>
      <button
        onClick={onCreateTask}
        className="px-6 py-3 rounded-xl font-semibold text-dark-base"
        style={{
          background: "linear-gradient(135deg, #00D67E, #00B468)",
        }}
      >
        Create First Task
      </button>
    </div>
  );
}
