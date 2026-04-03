import type { Meta, StoryObj } from '@storybook/react';
import { SourceForm } from '@/components/features/sources/SourceForm';

const meta = {
  title: 'Features/Sources/SourceForm',
  component: SourceForm,
  parameters: {
    layout: 'padded',
  },
  args: {
    onAdded: () => {},
  },
} satisfies Meta<typeof SourceForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Empty form',
};

export const WithValidationError: Story = {
  name: 'With validation error',
  render: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react') as typeof import('react');
    const { SourceForm: SF } = require('@/components/features/sources/SourceForm') as typeof import('@/components/features/sources/SourceForm');
    const [submitted, setSubmitted] = React.useState(false);

    if (!submitted) {
      return (
        <div>
          <p className="text-sm text-(--muted-foreground) mb-4">
            Submit the form without filling in the fields to see the validation error.
          </p>
          <SF onAdded={() => {}} />
        </div>
      );
    }
    return <SF onAdded={() => {}} />;
  },
};

export const Mobile: Story = {
  name: 'Mobile stacked layout',
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
  render: () => (
    <div className="p-4">
      <SourceForm onAdded={() => {}} />
    </div>
  ),
};
