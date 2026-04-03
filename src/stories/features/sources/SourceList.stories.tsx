import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SourceList } from '@/components/features/sources/SourceList';
import { mockSources } from '@/stories/fixtures';
import type { SourceRow } from '@/types';

const meta = {
  title: 'Features/Sources/SourceList',
  component: SourceList,
  parameters: {
    layout: 'padded',
  },
  args: {
    onDeleted: () => {},
  },
} satisfies Meta<typeof SourceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sources: mockSources,
  },
};

export const Empty: Story = {
  name: 'Empty state',
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

/**
 * DeleteConfirmationDemo uses a named component so React hooks are valid.
 * Click the trash icon on any row to see the inline "Delete source? / Keep source" confirmation.
 */
function DeleteConfirmationDemo() {
  const [sources, setSources] = useState<SourceRow[]>(mockSources);
  return (
    <div>
      <p className="text-sm text-(--muted-foreground) mb-4">
        Click the trash icon on any row to see the inline delete confirmation.
      </p>
      <SourceList
        sources={sources}
        onDeleted={(id) => setSources((prev) => prev.filter((s) => s.id !== id))}
      />
    </div>
  );
}

export const DeleteConfirmation: StoryObj = {
  name: 'Delete confirmation active',
  render: () => <DeleteConfirmationDemo />,
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
  args: {
    sources: mockSources,
  },
};
