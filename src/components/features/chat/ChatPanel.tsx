'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactElement,
} from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, Plus, X, PanelRight, PanelBottom, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { PromptChips } from './PromptChips';

interface ArticleContext {
  id: number;
  title: string;
  source: string;
  publishedAt: string | null;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleContext?: ArticleContext | null;
  onClearContext?: () => void;
  isEmbedded?: boolean;
}

const GENERIC_CHIPS = [
  "What's new with Claude?",
  'Top stories today',
  'Developer tools this week',
  'Summarize model releases',
];

const CONTEXTUAL_CHIPS = [
  'Summarize this article',
  'Why does this matter?',
  'Related articles',
  'Compare to competitors',
];

interface ToolResultArticle {
  title: string;
  source: string;
  publishedAt: string | null;
  link: string;
}

/** Tool part types in AI SDK v6 use `tool-<toolName>` pattern */
const TOOL_PART_PREFIXES = [
  'tool-searchArticles',
  'tool-articlesByTopic',
  'tool-recentArticles',
];

function isToolPart(type: string): boolean {
  return TOOL_PART_PREFIXES.includes(type) || type === 'dynamic-tool';
}

function extractSources(
  parts: Array<{ type: string; [key: string]: unknown }>
): ToolResultArticle[] {
  const seen = new Set<string>();
  const sources: ToolResultArticle[] = [];
  for (const part of parts) {
    if (isToolPart(part.type) && part.state === 'output-available') {
      const output = part.output;
      if (Array.isArray(output)) {
        for (const article of output) {
          if (
            article &&
            typeof article === 'object' &&
            'title' in article &&
            'link' in article
          ) {
            const link = String(article.link);
            if (seen.has(link)) continue;
            seen.add(link);
            sources.push({
              title: String(article.title),
              source: String(article.source ?? ''),
              publishedAt: article.publishedAt
                ? String(article.publishedAt)
                : null,
              link,
            });
          }
        }
      }
    }
  }
  return sources;
}

export function ChatPanel({
  isOpen,
  onClose,
  articleContext,
  onClearContext,
  isEmbedded = false,
}: ChatPanelProps): ReactElement {
  const { messages, sendMessage, status, error, setMessages } = useChat();

  // Clear messages when articleContext changes to a different article
  const prevContextIdRef = useRef<number | null>(null);
  useEffect(() => {
    const currentId = articleContext?.id ?? null;
    if (currentId !== null && currentId !== prevContextIdRef.current) {
      setMessages([]);
    }
    prevContextIdRef.current = currentId;
  }, [articleContext, setMessages]);

  // SSR-safe: always initialize to 'side', detect mobile in resize listener
  const [dockPosition, setDockPosition] = useState<'side' | 'bottom'>('side');
  const [panelWidth, setPanelWidth] = useState(420);
  const [panelHeight, setPanelHeight] = useState(25);
  const [isTyping, setIsTyping] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const initialDockRef = useRef(false);

  // Detect narrow viewport for full-width mode + initial mobile dock detection
  useEffect(() => {
    const checkWidth = (): void => {
      setIsNarrowViewport(window.innerWidth <= 430);
      // Set mobile bottom dock on first mount only
      if (!initialDockRef.current) {
        initialDockRef.current = true;
        if (window.innerWidth < 768) {
          setDockPosition('bottom');
        }
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Body scroll-lock when panel overlays content (not in embedded mode)
  useEffect(() => {
    if (isOpen && !isEmbedded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isEmbedded]);

  // CSS custom property + data attribute for embedded layout coordination
  useEffect(() => {
    if (isOpen && isEmbedded && dockPosition === 'side') {
      document.documentElement.style.setProperty('--chat-panel-width', `${panelWidth}px`);
      document.documentElement.dataset.chatEmbedded = 'true';
    } else {
      document.documentElement.style.removeProperty('--chat-panel-width');
      delete document.documentElement.dataset.chatEmbedded;
    }
    return () => {
      document.documentElement.style.removeProperty('--chat-panel-width');
      delete document.documentElement.dataset.chatEmbedded;
    };
  }, [isOpen, isEmbedded, panelWidth, dockPosition]);

  // Focus chat input when panel opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        chatInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Derive rate limit minutes from error (no effect needed)
  const rateLimited = useMemo((): number | null => {
    if (!error) return null;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error === 'rate_limited' && parsed.retryAfterMinutes) {
        return parsed.retryAfterMinutes as number;
      }
    } catch {
      // Not JSON, not rate limited
    }
    return null;
  }, [error]);

  // Auto-scroll chat container to bottom on new messages (without affecting parent scroll)
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Resize handling
  useEffect(() => {
    if (!isResizing) return;

    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent): void => {
      if (dockPosition === 'side') {
        const newWidth = Math.max(280, Math.min(800, window.innerWidth - e.clientX));
        setPanelWidth(newWidth);
        // Sync CSS variable immediately so grid column resizes without lag
        if (isEmbedded) {
          document.documentElement.style.setProperty('--chat-panel-width', `${newWidth}px`);
        }
      } else {
        const newHeightPx = window.innerHeight - e.clientY;
        const newHeightDvh = (newHeightPx / window.innerHeight) * 100;
        setPanelHeight(Math.max(15, Math.min(60, newHeightDvh)));
      }
    };

    const handleMouseUp = (): void => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, dockPosition, isEmbedded]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(
        { text },
        articleContext
          ? {
              body: {
                articleContext: {
                  title: articleContext.title,
                  source: articleContext.source,
                  publishedAt: articleContext.publishedAt,
                },
              },
            }
          : undefined
      );
    },
    [articleContext, sendMessage]
  );

  const handleChipClick = useCallback(
    (chip: string) => {
      handleSend(chip);
    },
    [handleSend]
  );

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    onClearContext?.();
  }, [setMessages, onClearContext]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const showEmptyState = messages.length === 0 && !isLoading;

  const chips = articleContext ? CONTEXTUAL_CHIPS : GENERIC_CHIPS;
  const placeholder = articleContext
    ? 'Ask anything about this article...'
    : 'Ask about any topic, source, or time period...';

  // Embedded side mode: panel flows in CSS Grid instead of fixed overlay
  const isEmbeddedSide = isEmbedded && dockPosition === 'side';

  // Panel position classes
  const panelPositionClasses = isEmbeddedSide
    ? 'h-[calc(100dvh-3rem)] sticky top-12 border-l border-[var(--border)] bg-[var(--background)]'
    : dockPosition === 'side'
      ? 'fixed top-0 right-0 h-full z-50 border-l border-[var(--border)] bg-[var(--background)]'
      : 'fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)]';

  const panelStyle: React.CSSProperties = isEmbeddedSide
    ? { gridColumn: 2, gridRow: 1 }
    : dockPosition === 'side'
      ? {
          width: isNarrowViewport ? '100%' : `${panelWidth}px`,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }
      : {
          height: `${panelHeight}dvh`,
          minHeight: '200px',
          maxHeight: '60dvh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        };

  return (
    <div
      ref={panelRef}
      role="complementary"
      aria-label="Chat"
      className={cn(
        panelPositionClasses,
        !isEmbeddedSide && 'transition-transform duration-200 ease-out',
        'flex flex-col',
        !isOpen && isEmbeddedSide && 'hidden',
      )}
      style={panelStyle}
    >
      {/* Resize handle (hidden on narrow viewports where panel is full-width) */}
      {dockPosition === 'side' && !isNarrowViewport ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--border)] transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      ) : dockPosition === 'bottom' ? (
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[var(--border)] transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      ) : null}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
        <span className="text-sm font-semibold text-[var(--foreground)]">
          Chat
        </span>
        <div className="flex gap-1">
          {!isEmbeddedSide && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setDockPosition((prev) =>
                  prev === 'side' ? 'bottom' : 'side'
                )
              }
              aria-label={
                dockPosition === 'side' ? 'Dock to bottom' : 'Dock to side'
              }
            >
              {dockPosition === 'side' ? (
                <PanelBottom size={16} />
              ) : (
                <PanelRight size={16} />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewConversation}
            aria-label="New conversation"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
        {showEmptyState && !articleContext && (
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
              <Sparkles size={22} className="text-[var(--muted-foreground)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Ask about your news
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] text-center max-w-[260px]">
              Search, summarize, and analyze articles from your collected
              sources.
            </p>
            <PromptChips
              chips={chips}
              onChipClick={handleChipClick}
              visible={!isTyping}
            />
          </div>
        )}

        {articleContext && (
          <div className="border-l-4 border-[var(--border)] bg-[var(--card)] rounded-[0.625rem] p-3 mx-0 mt-0 mb-4">
            <span className="text-[0.8125rem] font-semibold uppercase text-[var(--muted-foreground)] tracking-wide">
              Chatting about
            </span>
            <p className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 mt-1">
              {articleContext.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[0.8125rem] text-[var(--muted-foreground)]">
                {articleContext.source}
              </span>
              {articleContext.publishedAt && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full bg-[var(--muted-foreground)]" />
                  <span className="text-[0.8125rem] text-[var(--muted-foreground)]">
                    {formatDistanceToNow(
                      new Date(articleContext.publishedAt),
                      { addSuffix: true }
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {showEmptyState && articleContext && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <p className="text-sm text-[var(--muted-foreground)] text-center">
              What would you like to know?
            </p>
            <PromptChips
              chips={chips}
              onChipClick={handleChipClick}
              visible={!isTyping}
            />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role as 'user' | 'assistant'}
            parts={
              msg.parts as Array<{
                type: string;
                text?: string;
                [key: string]: unknown;
              }>
            }
            sources={
              msg.role === 'assistant'
                ? extractSources(
                    msg.parts as Array<{
                      type: string;
                      [key: string]: unknown;
                    }>
                  ).filter((s) => !articleContext || s.title !== articleContext.title)
                : undefined
            }
            isStreaming={
              msg.id === messages[messages.length - 1]?.id &&
              status === 'streaming'
            }
          />
        ))}

        {/* Loading indicator -- shown before assistant message exists */}
        {status === 'submitted' && (
          <div className="mb-2">
            <div className="mr-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-tl-sm max-w-[85%] px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Loader2 size={14} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg">
            <p className="text-sm text-[var(--muted-foreground)]">
              {rateLimited !== null
                ? `You've reached the hourly message limit. Try again in ${rateLimited} minute${rateLimited === 1 ? '' : 's'}.`
                : 'Something went wrong. Refresh the page or try again in a moment.'}
            </p>
          </div>
        )}

        {/* sentinel for future use */}
      </div>

      {/* Footer */}
      <ChatInput
        ref={chatInputRef}
        onSend={handleSend}
        disabled={isLoading || rateLimited !== null}
        placeholder={rateLimited !== null ? 'Message limit reached' : placeholder}
        onTypingChange={setIsTyping}
      />
    </div>
  );
}
