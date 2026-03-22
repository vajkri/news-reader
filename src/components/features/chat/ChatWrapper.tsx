'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatPanel } from './ChatPanel';
import { ChatFAB } from './ChatFAB';

const EMBEDDED_BREAKPOINT = 1320;

export function ChatWrapper(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [articleContext, setArticleContext] = useState<{
    id: number;
    title: string;
    source: string;
    publishedAt: string | null;
  } | null>(null);

  // Cmd+K / Ctrl+K keyboard shortcut (D-09) + Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

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

  // Embedded mode detection for desktop (>=1320px)
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    const checkEmbedded = (): void => setIsEmbedded(window.innerWidth >= EMBEDDED_BREAKPOINT);
    checkEmbedded();
    window.addEventListener('resize', checkEmbedded);
    return () => window.removeEventListener('resize', checkEmbedded);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) setArticleContext(null);
      return !prev;
    });
  }, []);
  const handleClearContext = useCallback(() => setArticleContext(null), []);

  return (
    <>
      <ChatFAB onClick={handleToggle} isOpen={isOpen} />
      <ChatPanel
        isOpen={isOpen}
        onClose={handleClose}
        articleContext={articleContext}
        onClearContext={handleClearContext}
        isEmbedded={isEmbedded}
      />
    </>
  );
}
