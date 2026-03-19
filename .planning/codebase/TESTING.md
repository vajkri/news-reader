# Testing Patterns

**Analysis Date:** 2026-03-19

## Test Framework

**Runner:**
- Not configured - no test runner detected (no jest.config.*, vitest.config.*, or test scripts in package.json)

**Assertion Library:**
- Not detected

**Run Commands:**
- No test commands configured in `package.json`
- Testing framework not yet integrated into project

## Test File Organization

**Location:**
- No test files found in codebase (zero `.test.*` and `.spec.*` files detected)

**Naming:**
- Not established

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- No test suites exist yet

**Patterns:**
- No setup/teardown patterns observed
- No assertion patterns established

## Mocking

**Framework:**
- Not configured

**Patterns:**
- No mocking infrastructure detected

**What to Mock:**
- When testing is implemented, these areas should be mocked:
  - External API calls (`rss-parser` in `src/lib/rss.ts`)
  - Database operations (`prisma` calls)
  - Network requests in components (e.g., `fetch()` calls in `src/components/feed/FeedTable.tsx`)

**What NOT to Mock:**
- Type definitions and interfaces
- Pure utility functions like `estimateReadTime` and `extractThumbnailFromItem`
- UI component rendering (use component testing library)

## Fixtures and Factories

**Test Data:**
- No fixtures or factories currently exist

**Location:**
- When implemented, recommend: `src/__tests__/fixtures/` for test data

## Coverage

**Requirements:**
- No coverage requirements enforced

**View Coverage:**
- Not configured

## Test Types

**Unit Tests:**
- Not implemented
- **Recommended scope for future:**
  - Utility functions: `estimateReadTime()`, `extractThumbnailFromItem()`, `fetchFeed()`
  - API validation logic (request body parsing, URL validation)
  - Data transformations in `buildColumns()`

**Integration Tests:**
- Not implemented
- **Recommended scope for future:**
  - API routes with mocked Prisma (e.g., `POST /api/sources`, `GET /api/articles`)
  - RSS fetch flow with mocked parser
  - Database state changes

**E2E Tests:**
- Not configured
- No E2E framework detected (no Playwright, Cypress, etc. in package.json)

## Common Patterns

### Async Testing (Future Implementation)

Components use async operations via `fetch()` and state management:

```typescript
// Pattern from src/components/feed/FeedTable.tsx
const loadArticles = useCallback(async () => {
  setLoading(true);
  const params = new URLSearchParams();
  if (sourceFilter) params.set("sourceId", sourceFilter);
  // ... build params

  const res = await fetch(`/api/articles?${params}`);
  const data = await res.json();
  setArticles(data.articles ?? []);
  setTotal(data.total ?? 0);
  setLoading(false);
}, [sourceFilter, categoryFilter, readFilter, sortBy]);
```

**Testing strategy when implemented:**
- Mock `fetch()` with `jest.mock()` or MSW (Mock Service Worker)
- Verify state updates after async completion
- Test loading state transitions

### Error Testing (Future Implementation)

Error handling patterns observed in components:

```typescript
// Pattern from src/components/sources/SourceForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!name.trim() || !url.trim()) {
    setError("Name and URL are required.");
    return;
  }

  try {
    new URL(url);
  } catch {
    setError("Please enter a valid URL.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, category }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to add source.");
      return;
    }
    onAdded(data);
    // ... reset form
  } finally {
    setLoading(false);
  }
};
```

**Testing strategy when implemented:**
- Test validation errors (empty name, invalid URL) set error state
- Mock fetch failures and verify error message display
- Test form reset on success
- Test loading state during request

### API Route Testing (Future Implementation)

API routes use pattern with validation and error responses:

```typescript
// Pattern from src/app/api/sources/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, url, category } = body as {...};

  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "Name and URL are required" },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const source = await prisma.source.create({...});
    return NextResponse.json(source, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "A source with this URL already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
```

**Testing strategy when implemented:**
- Mock `prisma.source.create()` to test success path
- Mock validation failures (invalid URL, missing fields)
- Mock Prisma duplicate key error (P2002) and verify 409 response
- Mock unexpected errors and verify they propagate

## Recommended Testing Setup

When implementing tests, consider:

1. **Test Framework:** Jest (ecosystem standard with Next.js)
2. **Component Testing:** React Testing Library (included with Next.js)
3. **Mocking:** `jest.mock()` for modules, consider MSW for HTTP
4. **API Testing:** Supertest or Next.js built-in testing utilities
5. **Database Testing:** Mock Prisma or use in-memory SQLite

## Gap Analysis

**Currently untested:**
- All utility functions: `estimateReadTime()`, `extractThumbnailFromItem()`, `fetchFeed()`
- All API routes: `/api/sources`, `/api/articles`, `/api/fetch`
- All components: `FeedTable`, `SourceForm`, `FeedToolbar`, `columns`
- RSS parsing and thumbnail extraction logic
- Article filtering and sorting
- Form validation and error handling
- Async state management in components

**High-priority coverage areas:**
- RSS feed fetching and article parsing (`src/lib/rss.ts`)
- API validation and error handling (`src/app/api/*/route.ts`)
- Component async operations and state transitions

---

*Testing analysis: 2026-03-19*
