import type { Meta, StoryObj } from '@storybook/react';
import { SourceList } from '@/components/features/sources/SourceList';
import { mockSources } from '@/stories/fixtures';

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
 * Delete confirmation: pre-selecting a source for deletion.
 * SourceList manages deletingId via internal state — we use a wrapper
 * to pre-trigger the confirmation for the first source.
 */
export const DeleteConfirmation: Story = {
  name: 'Delete confirmation active',
  render: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useState } = require('react') as typeof import('react');
    const [sources, setSources] = useState(mockSources);
    return (
      <div>
        <p className="text-sm text-(--muted-foreground) mb-4">
          Click the trash icon on any row to see the inline delete confirmation.
        </p>
        <SourceList
          sources={sources}
          onDeleted={(id) => setSources((prev: typeof mockSources) => prev.filter((s) => s.id !== id))}
        />
      </div>
    );
  },
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
