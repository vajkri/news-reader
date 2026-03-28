'use client';

import { type ComponentType } from 'react';
import { Button } from '@/components/ui/button';

export interface ChipConfig {
  label: string;
  icon?: ComponentType<{ size?: number }>;
}

interface PromptChipsProps {
  chips: ChipConfig[];
  onChipClick: (chip: ChipConfig) => void;
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
          key={chip.label}
          variant="outline"
          size="sm"
          className="rounded-full text-sm font-normal text-(--foreground-secondary) gap-1.5"
          onClick={() => onChipClick(chip)}
        >
          {chip.icon && <chip.icon size={14} />}
          {chip.label}
        </Button>
      ))}
    </div>
  );
}
