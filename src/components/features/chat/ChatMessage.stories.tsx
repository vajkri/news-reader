import { useReducer, useEffect, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessageProps } from './ChatMessage';

const meta = {
  title: 'Chat/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample sources for stories
const sampleSources = [
  {
    title: 'Claude 4 Released with Extended Thinking',
    source: 'Anthropic Blog',
    publishedAt: '2026-03-20T10:00:00Z',
    link: 'https://anthropic.com/claude-4',
  },
  {
    title: 'GPT-5 Benchmarks Show Major Reasoning Gains',
    source: 'OpenAI Blog',
    publishedAt: '2026-03-19T15:00:00Z',
    link: 'https://openai.com/gpt-5',
  },
  {
    title: 'Vite 8 Lands with Rolldown Integration',
    source: 'Hacker News',
    publishedAt: '2026-03-18T08:00:00Z',
    link: 'https://vitejs.dev/blog/vite-8',
  },
];

const fullResponseText = `## Latest Model Releases

Here are the key AI model releases from this week:

- **Claude 4** from Anthropic: features extended thinking, improved reasoning. [Claude 4 Released with Extended Thinking](https://anthropic.com/claude-4)
- **GPT-5** from OpenAI: major benchmark improvements in math and coding. [GPT-5 Benchmarks Show Major Reasoning Gains](https://openai.com/gpt-5)

### Key Takeaway

The competition between frontier labs is accelerating. Each release shows **significant gains** in reasoning and coding benchmarks.`;

// --- Static stories ---

export const UserPlainText: Story = {
  args: {
    role: 'user',
    parts: [{ type: 'text', text: 'What are the latest AI model releases this week?' }],
  },
};

export const AssistantPlainText: Story = {
  args: {
    role: 'assistant',
    parts: [{ type: 'text', text: 'Here are the latest AI model releases from this week based on the articles in the database.' }],
  },
};

export const AssistantMarkdown: Story = {
  args: {
    role: 'assistant',
    parts: [{
      type: 'text',
      text: `## Latest Model Releases

Here are the key AI model releases from this week:

- **Claude 4** from Anthropic: features extended thinking, improved reasoning
- **GPT-5** from OpenAI: major benchmark improvements in math and coding
- **Gemini 2.5 Pro** from Google: multimodal improvements

### Key Takeaway

The competition between frontier labs is accelerating. Each release shows **significant gains** in reasoning and coding benchmarks.

> "This represents the fastest pace of improvement we have seen in the industry."

For more details, check the individual articles below.`,
    }],
    sources: sampleSources,
  },
};

export const AssistantWithInlineSourceCards: Story = {
  args: {
    role: 'assistant',
    parts: [{
      type: 'text',
      text: `Two major model releases happened this week:

1. **Claude 4** was released with extended thinking capabilities. [Claude 4 Released with Extended Thinking](https://anthropic.com/claude-4)

2. **GPT-5** showed significant reasoning improvements. [GPT-5 Benchmarks Show Major Reasoning Gains](https://openai.com/gpt-5)

Both models represent a significant step forward in AI capabilities.`,
    }],
    sources: sampleSources,
  },
};

export const AssistantWithDeferredToggle: Story = {
  args: {
    role: 'assistant',
    parts: [{
      type: 'text',
      text: 'I found several articles about recent developer tools. The most notable is the Vite 8 release with Rolldown integration.',
    }],
    sources: sampleSources,
    isStreaming: false,
  },
};

export const AssistantThinking: Story = {
  name: 'Loading: Thinking',
  args: {
    role: 'assistant',
    parts: [],
    isStreaming: true,
  },
};

export const AssistantSearching: Story = {
  name: 'Loading: Searching',
  args: {
    role: 'assistant',
    parts: [{ type: 'tool-searchArticles', state: 'partial-call' }],
    sources: [],
    isStreaming: true,
  },
};

export const AssistantStreaming: Story = {
  args: {
    role: 'assistant',
    parts: [{
      type: 'text',
      text: 'Here are the latest updates on AI model rele',
    }],
    sources: sampleSources,
    isStreaming: true,
  },
};

export const AssistantCodeBlock: Story = {
  args: {
    role: 'assistant',
    parts: [{
      type: 'text',
      text: `Here is how to use the new API:

\`\`\`typescript
import { generateText } from 'ai';

const result = await generateText({
  model: 'claude-4',
  prompt: 'Hello, world!',
});
\`\`\`

You can also use the \`streamText\` function for streaming responses.`,
    }],
  },
};

export const AssistantNoResults: Story = {
  args: {
    role: 'assistant',
    parts: [{
      type: 'text',
      text: "I don't have any articles about quantum computing in the database. I can search for articles about AI model releases, developer tools, open source projects, and industry moves. Would you like to try a different topic?",
    }],
  },
};

// --- Interactive flow story ---

type FlowPhase = 'idle' | 'thinking' | 'searching' | 'streaming' | 'complete';

interface FlowState {
  phase: FlowPhase;
  streamedLength: number;
  messages: ChatMessageProps[];
}

type FlowAction =
  | { type: 'start' }
  | { type: 'reset' }
  | { type: 'add-assistant-thinking' }
  | { type: 'start-searching' }
  | { type: 'start-streaming' }
  | { type: 'stream-chunk'; length: number }
  | { type: 'finish' };

const initialFlowState: FlowState = {
  phase: 'idle',
  streamedLength: 0,
  messages: [],
};

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'start':
      return {
        phase: 'thinking',
        streamedLength: 0,
        messages: [{
          role: 'user',
          parts: [{ type: 'text', text: 'What are the latest AI model releases this week?' }],
        }],
      };
    case 'reset':
      return initialFlowState;
    case 'add-assistant-thinking': {
      return {
        ...state,
        phase: 'searching',
        messages: [
          ...state.messages,
          { role: 'assistant', parts: [{ type: 'tool-searchArticles', state: 'partial-call' }], sources: [], isStreaming: true },
        ],
      };
    }
    case 'start-searching': {
      const updated = [...state.messages];
      updated[updated.length - 1] = {
        role: 'assistant',
        parts: [{ type: 'tool-searchArticles', state: 'partial-call' }],
        sources: [],
        isStreaming: true,
      };
      return { ...state, messages: updated };
    }
    case 'start-streaming':
      return { ...state, phase: 'streaming', streamedLength: 1 };
    case 'stream-chunk': {
      const updated = [...state.messages];
      updated[updated.length - 1] = {
        role: 'assistant',
        parts: [{ type: 'text', text: fullResponseText.slice(0, action.length) }],
        sources: sampleSources,
        isStreaming: true,
      };
      return { ...state, streamedLength: action.length, messages: updated };
    }
    case 'finish': {
      const updated = [...state.messages];
      updated[updated.length - 1] = {
        role: 'assistant',
        parts: [{ type: 'text', text: fullResponseText }],
        sources: sampleSources,
        isStreaming: false,
      };
      return { ...state, phase: 'complete', messages: updated };
    }
    default:
      return state;
  }
}

function ChatFlowSimulation(): React.ReactElement {
  const [state, dispatch] = useReducer(flowReducer, initialFlowState);
  const { phase, streamedLength, messages } = state;

  const handleClick = useCallback(() => {
    dispatch(phase === 'idle' ? { type: 'start' } : { type: 'reset' });
  }, [phase]);

  // Phase transitions with realistic timing
  useEffect(() => {
    if (phase === 'thinking') {
      const timer = setTimeout(() => dispatch({ type: 'add-assistant-thinking' }), 1500);
      return () => clearTimeout(timer);
    }
    if (phase === 'searching') {
      const timer = setTimeout(() => dispatch({ type: 'start-streaming' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Text streaming simulation
  useEffect(() => {
    if (phase !== 'streaming') return;
    if (streamedLength >= fullResponseText.length) {
      dispatch({ type: 'finish' });
      return;
    }
    const timer = setTimeout(() => {
      const nextLength = Math.min(
        streamedLength + 3 + Math.floor(Math.random() * 5),
        fullResponseText.length
      );
      dispatch({ type: 'stream-chunk', length: nextLength });
    }, 30);
    return () => clearTimeout(timer);
  }, [phase, streamedLength]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 mb-4">
        {/* Disclosure controls, not action buttons */}
        <button
          onClick={handleClick}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
        >
          {phase === 'idle' ? 'Send message' : 'Reset'}
        </button>
        <span className="flex items-center text-xs text-[var(--muted-foreground)] font-mono">
          {phase}
        </span>
      </div>

      {messages.map((msg, i) => (
        <ChatMessage key={i} {...msg} />
      ))}

      {/* Thinking indicator (before assistant message exists) */}
      {phase === 'thinking' && messages.length === 1 && (
        <div className="mb-2">
          <div className="mr-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-tl-sm max-w-[85%] px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const InteractiveFlow: Story = {
  args: {
    role: 'assistant',
    parts: [],
  },
  render: () => <ChatFlowSimulation />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive simulation of the full chat flow: user sends message, AI thinks, searches articles, streams response, then shows deferred toggle.',
      },
    },
  },
};
