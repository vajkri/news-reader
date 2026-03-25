'use client';

import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ChatFABProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatFAB = forwardRef<HTMLButtonElement, ChatFABProps>(
  function ChatFAB({ onClick, isOpen }, ref): React.ReactElement {
    if (isOpen) return <></>;

    return (
      <Button
        ref={ref}
        variant="default"
        onClick={onClick}
        aria-label="Open chat"
        aria-expanded={false}
        className="fixed bottom-6 right-6 z-50 w-[52px] h-[52px] rounded-full shadow-lg p-0 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
      >
        <Sparkles size={22} />
      </Button>
    );
  }
);
