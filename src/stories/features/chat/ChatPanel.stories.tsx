import type { Meta, StoryObj } from '@storybook/react';
import { ChatPanel } from '@/components/features/chat/ChatPanel';

/**
 * ChatPanel uses useChat() which calls /api/chat.
 * We mock the fetch to avoid network calls in Storybook.
 * For static display stories, we just render the panel in its open state.
 */

const meta = {
  title: 'Features/Chat/ChatPanel',
  component: ChatPanel,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onClose: () => {},
    onClearContext: () => {},
  },
  decorators: [
    (Story) => {
      // Mock /api/chat to prevent unhandled network errors in stories
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('/api/chat')) {
          // Return a minimal streaming response that immediately closes
          const stream = new ReadableStream({
            start(controller) {
              controller.close();
            },
          });
          return new Response(stream, {
            status: 200,
            headers: { 'Content-Type': 'text/event-stream' },
          });
        }
        return originalFetch(input, init);
      };
      return (
        <div className="relative h-[600px] bg-(--background)">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClosedPanel: Story = {
  name: 'Closed',
  args: {
    isOpen: false,
  },
};

export const OpenEmpty: Story = {
  name: 'Open, empty state',
  args: {
    isOpen: true,
    isEmbedded: false,
  },
};

export const OpenWithArticleContext: Story = {
  name: 'Open with article context',
  args: {
    isOpen: true,
    isEmbedded: false,
    articleContext: {
      id: 1,
      title: 'Introducing Claude 4: Extended Thinking and Multimodal Reasoning',
      source: 'Anthropic Blog',
      publishedAt: '2026-04-03T08:00:00.000Z',
      link: 'https://anthropic.com/news/claude-4',
    },
  },
};

export const EmbeddedSidePanel: Story = {
  name: 'Embedded side panel',
  args: {
    isOpen: true,
    isEmbedded: true,
  },
  decorators: [
    (Story) => (
      <div className="flex h-[600px]">
        <div className="flex-1 p-4 bg-(--background) border-r border-(--border)">
          <p className="text-sm text-(--muted-foreground)">Main content area</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const MobileFullWidth: Story = {
  name: 'Mobile full-width',
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
  },
  args: {
    isOpen: true,
    isEmbedded: false,
  },
};
