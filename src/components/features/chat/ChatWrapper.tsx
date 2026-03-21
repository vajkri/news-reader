'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatPanel } from './ChatPanel';
import { ChatFAB } from './ChatFAB';

export function ChatWrapper(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [articleContext, setArticleContext] = useState<{
    id: number;
    title: string;
    source: string;
    publishedAt: string | null;
  } | null>(null);

  // Cmd+K / Ctrl+K keyboard shortcut (D-09)
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Listen for custom "chat-about-this" events from BriefingCard (D-18)
  useEffect(() => {
    const handler = (
      e: CustomEvent<{
        id: number;
        title: string;
        source: string;
        publishedAt: string | null;
      }>
    ): void => {
      setArticleContext(e.detail);
      setIsOpen(true);
    };
    window.addEventListener(
      'chat-about-this',
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        'chat-about-this',
        handler as EventListener
      );
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <>
      <ChatFAB onClick={handleToggle} isOpen={isOpen} />
      <ChatPanel
        isOpen={isOpen}
        onClose={handleClose}
        articleContext={articleContext}
      />
    </>
  );
}
