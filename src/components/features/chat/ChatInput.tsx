'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder: string;
  onTypingChange?: (isTyping: boolean) => void;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder,
  onTypingChange,
}: ChatInputProps): React.ReactElement {
  const [value, setValue] = useState('');

  useEffect(() => {
    onTypingChange?.(value.length > 0);
  }, [value, onTypingChange]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) {
        onSend(trimmed);
        setValue('');
      }
    },
    [value, onSend]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-[var(--border)]"
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Chat message"
        aria-disabled={disabled}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        type="submit"
        variant="default"
        size="icon"
        disabled={disabled || value.trim() === ''}
        aria-label={disabled ? 'Sending...' : 'Send message'}
      >
        <ArrowUp size={16} />
      </Button>
    </form>
  );
}
