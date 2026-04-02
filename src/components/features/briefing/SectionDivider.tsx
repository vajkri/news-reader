interface SectionDividerProps {
  label: string;
  variant: 'new' | 'reviewed';
}

export function SectionDivider({ label, variant }: SectionDividerProps): React.ReactElement {
  const textColor = variant === 'new' ? 'text-green-500' : 'text-(--muted-foreground)';
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="h-px flex-1 bg-(--border)" />
      <span className={`text-sm font-semibold whitespace-nowrap ${textColor}`}>
        {label}
      </span>
      <div className="h-px flex-1 bg-(--border)" />
    </div>
  );
}
