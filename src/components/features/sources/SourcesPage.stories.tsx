import type { Meta, StoryObj } from '@storybook/react';
import { SourceForm } from './SourceForm';
import { SourceList } from './SourceList';
import type { SourceRow } from '@/types';

const sampleSources: SourceRow[] = [
  {
    id: 1,
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'tech',
    createdAt: '2026-03-18T10:00:00Z',
    _count: { articles: 142 },
  },
  {
    id: 2,
    name: 'TLDR AI',
    url: 'https://tldr-rss.vercel.app/tldr-ai',
    category: 'ai',
    createdAt: '2026-03-18T10:00:00Z',
    _count: { articles: 87 },
  },
  {
    id: 3,
    name: 'TLDR Tech',
    url: 'https://tldr-rss.vercel.app/tldr-tech',
    category: 'tech',
    createdAt: '2026-03-19T14:00:00Z',
    _count: { articles: 63 },
  },
  {
    id: 4,
    name: 'TLDR Design',
    url: 'https://tldr-rss.vercel.app/tldr-design',
    category: 'design',
    createdAt: '2026-03-20T09:00:00Z',
    _count: { articles: 28 },
  },
];

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-container py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">RSS Sources</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Manage the RSS feeds your reader pulls from.
        </p>
      </div>
      {children}
    </div>
  );
}

const noop = () => {};

const meta = {
  title: 'Sources/SourcesPage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 1.5rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  render: () => (
    <PageShell>
      <SourceForm onAdded={noop} />
      <div className="py-8 flex justify-center">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading sources...
        </div>
      </div>
    </PageShell>
  ),
};

export const WithSources: Story = {
  render: () => (
    <PageShell>
      <SourceForm onAdded={noop} />
      <SourceList sources={sampleSources} onDeleted={noop} />
    </PageShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <PageShell>
      <SourceForm onAdded={noop} />
      <SourceList sources={[]} onDeleted={noop} />
    </PageShell>
  ),
};

export const FetchError: Story = {
  render: () => (
    <PageShell>
      <SourceForm onAdded={noop} />
      <SourceList sources={[]} onDeleted={noop} error="Failed to load sources (500)" />
    </PageShell>
  ),
};

export const NetworkError: Story = {
  render: () => (
    <PageShell>
      <SourceForm onAdded={noop} />
      <SourceList sources={[]} onDeleted={noop} error="Failed to fetch" />
    </PageShell>
  ),
};
