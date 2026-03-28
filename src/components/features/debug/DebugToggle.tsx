'use client';

import { Bug, BugOff } from 'lucide-react';
import { useDebug } from '@/contexts/debug';
import { Button } from '@/components/ui/button';

function DebugToggleInner(): React.ReactElement {
  const { debugMode, toggleDebug } = useDebug();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDebug}
      className={`fixed bottom-4 right-4 z-50 ${debugMode ? 'opacity-100' : 'opacity-60'} hover:opacity-100`}
      aria-label={debugMode ? 'Disable debug mode' : 'Enable debug mode'}
      aria-pressed={debugMode}
    >
      {debugMode ? <BugOff size={16} /> : <Bug size={16} />}
    </Button>
  );
}

export function DebugToggle(): React.ReactElement | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DebugToggleInner />;
}
