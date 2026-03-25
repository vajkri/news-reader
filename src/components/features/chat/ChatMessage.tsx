'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { SourceCard } from './SourceCard';

export interface ChatMessageSource {
  title: string;
  source: string;
  publishedAt: string | null;
  link: string;
}

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>;
  sources?: ChatMessageSource[];
  isStreaming?: boolean;
}

function SourcesToggle({
  sources,
}: {
  sources: ChatMessageSource[];
}): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2">
      {/* Disclosure toggle, not action button -- raw button is appropriate */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex items-center gap-1.5 text-[0.8125rem] text-(--muted-foreground) hover:text-(--foreground) transition-colors focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:outline-none rounded px-1.5 py-1"
      >
        <Search size={13} />
        <span>
          Searched {sources.length} article{sources.length === 1 ? '' : 's'}
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="flex flex-col gap-2 mt-2">
          {sources.map((src) => (
            <SourceCard
              key={src.link}
              title={src.title}
              source={src.source}
              publishedAt={src.publishedAt}
              link={src.link}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatMessage({
  role,
  parts,
  sources,
  isStreaming = false,
}: ChatMessageProps): React.ReactElement {
  const text = parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');

  const hasToolParts = parts.some(
    (p) => p.type.startsWith('tool-') || p.type === 'dynamic-tool'
  );

  const showLoading = role === 'assistant' && isStreaming && !text;
  const loadingLabel = hasToolParts ? 'Searching articles...' : 'Thinking...';

  return (
    <div className="mb-2">
      <div
        className={
          role === 'user'
            ? 'ml-auto bg-(--chat-user-bg) text-(--chat-user-fg) rounded-2xl rounded-tr-sm max-w-[85%] px-4 py-2.5'
            : 'mr-auto bg-(--card) border border-(--border) text-(--foreground) rounded-2xl rounded-tl-sm max-w-[85%] px-4 py-2.5'
        }
      >
        {showLoading ? (
          <div className="flex items-center gap-2 text-sm text-(--muted-foreground)">
            <Loader2 size={14} className="animate-spin" />
            <span>{loadingLabel}</span>
          </div>
        ) : role === 'assistant' ? (
          <div className="chat-prose text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  if (href && sources) {
                    const matchedSource = sources.find(
                      (s) => s.link === href
                    );
                    if (matchedSource) {
                      return (
                        <SourceCard
                          title={matchedSource.title}
                          source={matchedSource.source}
                          publishedAt={matchedSource.publishedAt}
                          link={matchedSource.link}
                        />
                      );
                    }
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--primary) underline underline-offset-2 hover:opacity-80"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        )}

        {role === 'assistant' &&
          sources &&
          sources.length > 0 &&
          !isStreaming && <SourcesToggle sources={sources} />}
      </div>
    </div>
  );
}
