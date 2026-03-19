import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/enrich', () => ({
  fetchUnenrichedArticles: vi.fn().mockResolvedValue([]),
  enrichArticlesBatch: vi.fn().mockResolvedValue([]),
  saveEnrichmentResults: vi.fn().mockResolvedValue({ saved: 0, errors: [] }),
}));

import { GET } from './route';

describe('GET /api/enrich', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('returns 401 when no Authorization header', async () => {
    const request = new Request('http://localhost/api/enrich');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('returns 401 when Authorization header has wrong token', async () => {
    const request = new Request('http://localhost/api/enrich', {
      headers: { Authorization: 'Bearer wrong-token' },
    });
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
