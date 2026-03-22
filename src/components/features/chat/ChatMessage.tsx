'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, Search } from 'lucide-react';
import { SourceCard } from './SourceCard';

interface ChatMessageSource {
  title: string;
  source: string;
  publishedAt: string | null;
  link: string;
}

interface ChatMessageProps {
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
        className="flex items-center gap-1.5 text-[0.8125rem] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none rounded px-1.5 py-1"
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

  return (
    <div className="mb-2">
      <div
        className={
          role === 'user'
            ? 'ml-auto bg-[var(--chat-user-bg)] text-[var(--chat-user-fg)] rounded-2xl rounded-tr-sm max-w-[85%] px-4 py-2.5'
            : 'mr-auto bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl rounded-tl-sm max-w-[85%] px-4 py-2.5'
        }
      >
        {role === 'assistant' ? (
          <div className="chat-prose text-base leading-relaxed">
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
                      className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80"
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
          <p className="text-base leading-relaxed whitespace-pre-wrap">
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
