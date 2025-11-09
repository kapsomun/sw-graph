/// <reference types="@testing-library/jest-dom" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';
import { createTestQueryClient } from '../../../tests/utils/render';

// Mock API modules
vi.mock('@/entities/person/api', () => ({ fetchPerson: vi.fn() }));
vi.mock('@/entities/film/api', () => ({ fetchFilms: vi.fn() }));
vi.mock('@/entities/starship/api', () => ({ fetchStarships: vi.fn() }));

// Imports AFTER vi.mock
import usePersonGraphData from './usePersonGraphData';
import { fetchPerson } from '@/entities/person/api';
import { fetchFilms } from '@/entities/film/api';
import { fetchStarships } from '@/entities/starship/api';

const fetchPersonMock = fetchPerson as unknown as Mock;
const fetchFilmsMock = fetchFilms as unknown as Mock;
const fetchStarshipsMock = fetchStarships as unknown as Mock;

function wrapperFactory() {
  const qc = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePersonGraphData', () => {
  it('builds the graph and keeps films even when starship intersection is empty', async () => {
    fetchPersonMock.mockResolvedValueOnce({
      id: 1,
      name: 'Luke Skywalker',
      films: [10, 20],
      starships: [100, 101],
    });

    fetchFilmsMock.mockResolvedValueOnce([
      { id: 10, title: 'A New Hope', starships: [100, 999] },
      { id: 20, title: 'The Empire Strikes Back', starships: [555] },
    ]);

    fetchStarshipsMock.mockResolvedValueOnce([{ id: 100, name: 'X-wing' }]);

    const { result } = renderHook(() => usePersonGraphData(1), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const data = result.current.data!;
    expect(data.person).toEqual({ id: 1, name: 'Luke Skywalker' });
    expect(fetchStarshipsMock).toHaveBeenCalledTimes(1);
    expect(fetchStarshipsMock).toHaveBeenCalledWith([100]);
    expect(data.films).toEqual([
      { id: 10, title: 'A New Hope', starships: [{ id: 100, name: 'X-wing' }] },
      { id: 20, title: 'The Empire Strikes Back', starships: [] },
    ]);
  });

  it('does not call fetchStarships when intersection is empty for all films', async () => {
    fetchPersonMock.mockResolvedValueOnce({
      id: 2,
      name: 'Han Solo',
      films: [30],
      starships: [200],
    });
    fetchFilmsMock.mockResolvedValueOnce([
      { id: 30, title: 'Return of the Jedi', starships: [300, 301] },
    ]);

    const { result } = renderHook(() => usePersonGraphData(2), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchStarshipsMock).not.toHaveBeenCalled();
    expect(result.current.data!.films).toEqual([
      { id: 30, title: 'Return of the Jedi', starships: [] },
    ]);
  });

  it('propagates error from fetchPerson', async () => {
    fetchPersonMock.mockRejectedValueOnce(new Error('Person not found'));

    const { result } = renderHook(() => usePersonGraphData(404), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Person not found');
  });

  it('uses id in the queryKey and refetches when id changes', async () => {
    // id=1
    fetchPersonMock.mockResolvedValueOnce({
      id: 1, name: 'Luke', films: [10], starships: [100],
    });
    fetchFilmsMock.mockResolvedValueOnce([{ id: 10, title: 'A', starships: [100] }]);
    fetchStarshipsMock.mockResolvedValueOnce([{ id: 100, name: 'X-wing' }]);

    const { result, rerender } = renderHook(({ id }) => usePersonGraphData(id), {
      initialProps: { id: 1 },
      wrapper: wrapperFactory(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.person.name).toBe('Luke');
    expect(fetchPersonMock).toHaveBeenCalledWith(1);

    // id=2
    fetchPersonMock.mockResolvedValueOnce({
      id: 2, name: 'Leia', films: [20], starships: [],
    });
    fetchFilmsMock.mockResolvedValueOnce([{ id: 20, title: 'B', starships: [] }]);

    rerender({ id: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.person.name).toBe('Leia');
    expect(fetchPersonMock).toHaveBeenCalledWith(2);
  });
});
