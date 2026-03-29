'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface DebugContextValue {
  debugMode: boolean;
  toggleDebug: () => void;
}

const DebugContext = createContext<DebugContextValue>({
  debugMode: false,
  toggleDebug: () => {},
});

function DebugProviderInner({ children }: { children: ReactNode }): React.ReactElement {
  const [debugMode, setDebugMode] = useState(false);

  const toggleDebug = (): void => {
    setDebugMode((prev) => !prev);
  };

  return (
    <DebugContext value={{ debugMode, toggleDebug }}>
      {children}
    </DebugContext>
  );
}

export function DebugProvider({ children }: { children: ReactNode }): React.ReactElement {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return <DebugProviderInner>{children}</DebugProviderInner>;
}

export function useDebug(): DebugContextValue {
  return useContext(DebugContext);
}
