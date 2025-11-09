import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/http', () => ({
  http: vi.fn(),
}));

import { fetchPeople, fetchPerson } from './api';
import { http } from '@/shared/lib/http';

type HttpMock = ReturnType<typeof vi.fn>;

// Minimal stub types for what we verify
type PersonApi = {
  name: string;
  url: string;
  films: number[];
  starships: number[];
};
type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const httpMock = http as unknown as HttpMock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchPeople', () => {
  it('uses page=1 by default and normalizes id from url', async () => {
    const apiResponse: Paginated<PersonApi> = {
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'Luke', url: '/people/1/', films: [10], starships: [100] },
        { name: 'Leia', url: '/people/2', films: [20], starships: [] },
      ],
    };
    httpMock.mockResolvedValueOnce(apiResponse);

    const data = await fetchPeople(); // page=1, search=''
    expect(httpMock).toHaveBeenCalledWith('/people/?page=1');
    expect(data.count).toBe(2);
    // IDs must be extracted from the URL
    expect(data.results[0]).toMatchObject({ name: 'Luke', id: 1 });
    expect(data.results[1]).toMatchObject({ name: 'Leia', id: 2 });
  });

  it('adds search parameter when provided', async () => {
    const apiResponse: Paginated<PersonApi> = {
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'Luke', url: '/people/1/', films: [], starships: [] }],
    };
    httpMock.mockResolvedValueOnce(apiResponse);

    const data = await fetchPeople(3, 'sky walker'); 
    expect(httpMock).toHaveBeenCalledWith('/people/?page=3&search=sky+walker');
    expect(data.results[0].id).toBe(1);
  });

  it('returns NaN for id if the URL does not match expected pattern', async () => {
    const apiResponse: Paginated<PersonApi> = {
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'Unknown', url: '/people/not-a-number', films: [], starships: [] }],
    };
    httpMock.mockResolvedValueOnce(apiResponse);

    const data = await fetchPeople(2);
    expect(httpMock).toHaveBeenCalledWith('/people/?page=2');
    expect(Number.isNaN(data.results[0].id)).toBe(true);
  });
});

describe('fetchPerson', () => {
  it('fetches by exact path and returns object with given id', async () => {
    httpMock.mockResolvedValueOnce({
      name: 'Luke',
      url: '/people/99/', 
      films: [10],
      starships: [100],
    });

    const p = await fetchPerson(7);
    expect(httpMock).toHaveBeenCalledWith('/people/7/');
    expect(p).toMatchObject({ name: 'Luke', id: 7 });
  });
});
