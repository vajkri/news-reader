'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

interface ChatFABProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatFAB({
  onClick,
  isOpen,
}: ChatFABProps): React.ReactElement {
  return (
    <Button
      variant="default"
      onClick={onClick}
      aria-label="Open chat"
      aria-expanded={isOpen}
      className="fixed bottom-6 right-6 z-50 w-[52px] h-[52px] rounded-full shadow-lg p-0 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
    >
      {isOpen ? <X size={22} /> : <Sparkles size={22} />}
    </Button>
  );
}
