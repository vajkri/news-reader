import type { Meta, StoryObj } from '@storybook/react';
import { SourceList } from '@/components/features/sources/SourceList';
import { SourceForm } from '@/components/features/sources/SourceForm';
import { mockSources } from '@/stories/fixtures';

/**
 * Page-level Sources composition stories.
 *
 * The actual Sources page is a Server Component that fetches from Prisma.
 * We compose SourceForm + SourceList with fixture data to recreate
 * meaningful page states.
 */

interface SourcesPageCompositionProps {
  sources: typeof mockSources;
  error?: string;
}

function SourcesPageComposition({
  sources,
  error,
}: SourcesPageCompositionProps) {
  return (
    <div className="section-container py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-(--foreground)">RSS Sources</h1>
        <p className="text-sm text-(--muted-foreground)">
          Manage the RSS feeds your reader pulls from.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-base font-semibold text-(--foreground) mb-3">
          Add RSS source
        </h2>
        <SourceForm onAdded={() => {}} />
      </div>
      <SourceList sources={sources} onDeleted={() => {}} error={error} />
    </div>
  );
}

const meta = {
  title: 'Pages/Sources',
  component: SourcesPageComposition,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SourcesPageComposition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default with sources',
  args: {
    sources: mockSources,
  },
};

export const Empty: Story = {
  name: 'No sources',
  args: {
    sources: [],
  },
};

export const WithError: Story = {
  name: 'With load error',
  args: {
    sources: [],
    error: 'Failed to load sources (503)',
  },
};
