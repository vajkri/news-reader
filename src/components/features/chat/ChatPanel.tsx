'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactElement,
} from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, X, PanelRight, PanelBottom } from 'lucide-react';
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
            sources.push({
              title: String(article.title),
              source: String(article.source ?? ''),
              publishedAt: article.publishedAt
                ? String(article.publishedAt)
                : null,
              link: String(article.link),
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
}: ChatPanelProps): ReactElement {
  const { messages, sendMessage, status, error, setMessages } = useChat();

  const [dockPosition, setDockPosition] = useState<'side' | 'bottom'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom' : 'side'
  );
  const [panelWidth, setPanelWidth] = useState(350);
  const [panelHeight, setPanelHeight] = useState(25);
  const [isTyping, setIsTyping] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resize handling
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent): void => {
      if (dockPosition === 'side') {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.max(280, Math.min(600, newWidth)));
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, dockPosition]);

  const handleSend = useCallback(
    (text: string) => {
      if (articleContext && messages.length === 0) {
        sendMessage({
          text: `[Context: Discussing article "${articleContext.title}" from ${articleContext.source}] ${text}`,
        });
      } else {
        sendMessage({ text });
      }
    },
    [articleContext, messages.length, sendMessage]
  );

  const handleChipClick = useCallback(
    (chip: string) => {
      handleSend(chip);
    },
    [handleSend]
  );

  const handleNewConversation = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const chips = articleContext ? CONTEXTUAL_CHIPS : GENERIC_CHIPS;
  const placeholder = articleContext
    ? 'Ask anything about this article...'
    : 'Ask about any topic, source, or time period...';

  // Panel position classes
  const panelPositionClasses =
    dockPosition === 'side'
      ? 'fixed top-0 right-0 h-full z-50 border-l border-[var(--border)] bg-[var(--background)]'
      : 'fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)]';

  const panelStyle =
    dockPosition === 'side'
      ? {
          width: `${panelWidth}px`,
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
      className={`${panelPositionClasses} transition-transform duration-200 ease-out flex flex-col`}
      style={panelStyle}
    >
      {/* Resize handle */}
      {dockPosition === 'side' ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--border)] transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      ) : (
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[var(--border)] transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
        <span className="text-sm font-semibold text-[var(--foreground)]">
          Chat
        </span>
        <div className="flex gap-1">
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
      <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
        {messages.length === 0 && !articleContext && (
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

        {messages.length === 0 && articleContext && (
          <div className="flex flex-col h-full">
            <div className="border-l-4 border-[var(--border)] bg-[var(--card)] rounded-[0.625rem] p-3 mx-0 mt-0">
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
                  )
                : undefined
            }
          />
        ))}

        {/* Loading indicator */}
        {status === 'submitted' && (
          <div className="mb-2">
            <div
              className="mr-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-tl-sm max-w-[85%] px-4 py-2.5"
              aria-label="Thinking..."
            >
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-2 p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg">
            <p className="text-sm text-[var(--muted-foreground)]">
              Something went wrong. Refresh the page or try again in a moment.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        placeholder={placeholder}
        onTypingChange={setIsTyping}
      />
    </div>
  );
}
