# Storybook Story Maintenance

When you create or modify a component in `src/components/`, you MUST update or create the corresponding Storybook story in `src/stories/`.

## Story structure mirrors component structure

| Component path | Story path |
|---------------|------------|
| `src/components/ui/Button.tsx` | `src/stories/ui/Button.stories.tsx` |
| `src/components/features/feed/FeedTable.tsx` | `src/stories/features/feed/FeedTable.stories.tsx` |
| `src/app/page.tsx` (page) | `src/stories/pages/Feed.stories.tsx` |

## Rules

- Stories must import actual components, never reimplement them
- Fixture data lives in `src/stories/fixtures.ts`; update when data shapes change
- Use CSF 3 format with `satisfies Meta<typeof Component>`
- Cover all meaningful states: default, loading, empty, error, mobile variants
- No made-up states; only showcase what the app actually renders
- Run `pnpm build-storybook` to verify stories compile after changes
