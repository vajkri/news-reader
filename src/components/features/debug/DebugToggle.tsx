'use client';

import { Bug } from 'lucide-react';
import { useDebug } from '@/contexts/debug';
import { Switch } from '@/components/ui/switch';

function DebugToggleInner(): React.ReactElement {
  const { debugMode, toggleDebug } = useDebug();

  return (
    <div
      className="fixed bottom-[72px] left-[20px] z-50 flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-2.5 py-1.5 shadow-md [--primary:var(--debug-active)] [--muted:var(--debug-inactive)]"
    >
      <Bug
        size={14}
        className={debugMode ? 'text-(--debug-active)' : 'text-(--debug-inactive)'}
      />
      <Switch
        checked={debugMode}
        onCheckedChange={toggleDebug}
        aria-label={debugMode ? 'Disable debug mode' : 'Enable debug mode'}
      />
    </div>
  );
}

export function DebugToggle(): React.ReactElement | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DebugToggleInner />;
}
