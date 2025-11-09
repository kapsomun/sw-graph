import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock the HTTP wrapper to avoid making real network requests during tests
vi.mock('@/shared/lib/http', () => ({
  http: vi.fn(),
}));

import { fetchStarship, fetchStarships } from './api';
import { http } from '@/shared/lib/http';

const httpMock = http as unknown as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchStarship', () => {
  it('calls http with the correct URL and returns data with the added id', async () => {
    httpMock.mockResolvedValueOnce({
      name: 'X-wing',
      url: '/starships/1/',
    });

    const res = await fetchStarship(1);

    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledWith('/starships/1/');
    expect(res).toEqual({
      name: 'X-wing',
      url: '/starships/1/',
      id: 1,
    });
  });
});

describe('fetchStarships', () => {
  it('fetches multiple starships in parallel (one request per id) and preserves result order', async () => {
    // Generic mock implementation that builds the response based on the request path
    httpMock.mockImplementation((path: string) => {
      const m = path.match(/\/starships\/(\d+)\/$/);
      const id = m ? Number(m[1]) : NaN;
      return Promise.resolve({
        name: `Ship-${id}`,
        url: `/starships/${id}/`,
      });
    });

    const ids = [5, 2, 9];
    const res = await fetchStarships(ids);

    // Should be exactly 3 calls
    expect(httpMock).toHaveBeenCalledTimes(3);
    expect(httpMock).toHaveBeenNthCalledWith(1, '/starships/5/');
    expect(httpMock).toHaveBeenNthCalledWith(2, '/starships/2/');
    expect(httpMock).toHaveBeenNthCalledWith(3, '/starships/9/');

    // The result order should match the ids order (Promise.all preserves order)
    expect(res).toEqual([
      { name: 'Ship-5', url: '/starships/5/', id: 5 },
      { name: 'Ship-2', url: '/starships/2/', id: 2 },
      { name: 'Ship-9', url: '/starships/9/', id: 9 },
    ]);
  });

  it('throws an error if one of the requests fails', async () => {
    httpMock.mockImplementation((path: string) => {
      if (path.includes('/2/')) {
        return Promise.reject(new Error('Boom on 2'));
      }
      const m = path.match(/\/starships\/(\d+)\/$/);
      const id = m ? Number(m[1]) : NaN;
      return Promise.resolve({
        name: `Ship-${id}`,
        url: `/starships/${id}/`,
      });
    });

    await expect(fetchStarships([1, 2, 3])).rejects.toThrow('Boom on 2');

    // Verify that the necessary calls were made (at least up to the failure)
    expect(httpMock).toHaveBeenCalledWith('/starships/1/');
    expect(httpMock).toHaveBeenCalledWith('/starships/2/');
    // The third request may not complete due to Promise.all failing fast
  });
});
