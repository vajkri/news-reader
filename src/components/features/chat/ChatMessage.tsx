'use client';

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
}

export function ChatMessage({
  role,
  parts,
  sources,
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
            ? 'ml-auto bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl rounded-tr-sm max-w-[85%] px-4 py-2.5'
            : 'mr-auto bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl rounded-tl-sm max-w-[85%] px-4 py-2.5'
        }
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      {sources && sources.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 mr-auto max-w-[85%]">
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
