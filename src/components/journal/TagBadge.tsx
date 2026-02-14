interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TagBadge({ tag, onClick, onRemove }: TagBadgeProps) {
  const isClickable = onClick !== undefined;
  const isRemovable = onRemove !== undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ${
        isClickable ? 'cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      {tag}
      {isRemovable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
          aria-label={`Remove ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
