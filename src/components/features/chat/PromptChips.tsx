'use client';

import { Button } from '@/components/ui/button';

interface PromptChipsProps {
  chips: string[];
  onChipClick: (chip: string) => void;
  visible: boolean;
}

export function PromptChips({
  chips,
  onChipClick,
  visible,
}: PromptChipsProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {chips.map((chip) => (
        <Button
          key={chip}
          variant="outline"
          size="sm"
          className="rounded-full text-sm font-normal text-[var(--foreground-secondary)]"
          onClick={() => onChipClick(chip)}
        >
          {chip}
        </Button>
      ))}
    </div>
  );
}
