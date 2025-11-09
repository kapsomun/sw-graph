import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock http to avoid real network calls
vi.mock('@/shared/lib/http', () => ({
  http: vi.fn(),
}));

import { fetchFilm, fetchFilms } from './api';
import { http } from '@/shared/lib/http';

const httpMock = http as unknown as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchFilm', () => {
  it('calls http with the correct path and appends id to the response', async () => {
    httpMock.mockResolvedValueOnce({
      title: 'A New Hope',
      url: '/films/1/',
    });

    const result = await fetchFilm(1);

    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledWith('/films/1/');
    expect(result).toEqual({
      title: 'A New Hope',
      url: '/films/1/',
      id: 1,
    });
  });
});

describe('fetchFilms', () => {
  it('returns an empty array if ids is empty', async () => {
    const res = await fetchFilms([]);
    expect(res).toEqual([]);
    expect(httpMock).not.toHaveBeenCalled();
  });

  it('fetches all films in parallel and preserves result order', async () => {
    httpMock.mockImplementation((path: string) => {
      const match = path.match(/\/films\/(\d+)\/$/);
      const id = match ? Number(match[1]) : NaN;
      return Promise.resolve({
        title: `Film-${id}`,
        url: `/films/${id}/`,
      });
    });

    const ids = [1, 3, 5];
    const res = await fetchFilms(ids);

    expect(httpMock).toHaveBeenCalledTimes(3);
    expect(httpMock).toHaveBeenNthCalledWith(1, '/films/1/');
    expect(httpMock).toHaveBeenNthCalledWith(2, '/films/3/');
    expect(httpMock).toHaveBeenNthCalledWith(3, '/films/5/');

    expect(res).toEqual([
      { title: 'Film-1', url: '/films/1/', id: 1 },
      { title: 'Film-3', url: '/films/3/', id: 3 },
      { title: 'Film-5', url: '/films/5/', id: 5 },
    ]);
  });

  it('throws an error if one of the requests fails', async () => {
    httpMock.mockImplementation((path: string) => {
      if (path.includes('/3/')) {
        return Promise.reject(new Error('Boom on 3'));
      }
      const match = path.match(/\/films\/(\d+)\/$/);
      const id = match ? Number(match[1]) : NaN;
      return Promise.resolve({ title: `Film-${id}`, url: `/films/${id}/` });
    });

    await expect(fetchFilms([1, 3, 5])).rejects.toThrow('Boom on 3');

    expect(httpMock).toHaveBeenCalledWith('/films/1/');
    expect(httpMock).toHaveBeenCalledWith('/films/3/');
  });
});
