import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';

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
