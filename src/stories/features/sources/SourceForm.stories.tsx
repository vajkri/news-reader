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

/**
 * To see validation errors: submit the form without filling in any fields.
 * SourceForm validates client-side on submit, so the story uses the real component.
 */
export const WithValidationError: StoryObj = {
  name: 'With validation error',
  render: () => (
    <div>
      <p className="text-sm text-(--muted-foreground) mb-4">
        Submit the form without filling in the fields to see the validation error.
      </p>
      <SourceForm onAdded={() => {}} />
    </div>
  ),
};

export const Mobile: StoryObj = {
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
