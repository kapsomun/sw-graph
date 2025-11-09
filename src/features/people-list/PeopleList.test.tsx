/// <reference types="@testing-library/jest-dom" />

import { screen } from '@testing-library/react';
import { render } from '@tests/utils/render';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';

const fetchNextPageMock = vi.fn();

// --- mocks ---
vi.mock('@/entities/person/queries', () => ({ usePeopleInfinite: vi.fn() }));
vi.mock('./PersonCard', () => ({
  default: ({ person }: { person: { id: string; name: string } }) => (
    <div data-testid="person-card">{person.name}</div>
  ),
}));
vi.mock('@/shared/ui/Spinner', () => ({ Spinner: () => <div role="status">loading...</div> }));
vi.mock('./PeopleListSkeleton', () => ({
  PeopleListSkeleton: () => <div data-testid="people-list-skeleton" />,
}));

import { usePeopleInfinite } from '@/entities/person/queries';
import { PeopleList } from './PeopleList';

const mockedUsePeopleInfinite = usePeopleInfinite as unknown as Mock;

type Page = { results: Array<{ id: string; name: string }> };
type HookState = {
  data?: { pages: Page[] };
  fetchNextPage: () => Promise<unknown> | void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isError: boolean;
  error?: unknown;
};

function baseState(): HookState {
  return {
    data: undefined,
    fetchNextPage: fetchNextPageMock,
    hasNextPage: false,
    isFetchingNextPage: false,
    isPending: false,
    isError: false,
    error: undefined,
  };
}

function setHookState(partial: Partial<HookState>) {
  mockedUsePeopleInfinite.mockReturnValue({ ...baseState(), ...partial });
}

/** Temporary IntersectionObserver replacement for the test duration */
function withIOStub<T>(run: (emit: (entries: IntersectionObserverEntry[]) => void) => T): T {
  let lastCallback: IntersectionObserverCallback | null = null;

  class IOStub implements IntersectionObserver {
    readonly root: Document | Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(cb: IntersectionObserverCallback) {
      lastCallback = cb;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn<() => IntersectionObserverEntry[]>().mockReturnValue([]);
  }

  const original = globalThis.IntersectionObserver;
  try {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      value: IOStub as unknown as typeof IntersectionObserver,
      writable: true,
      configurable: true,
    });
  } catch {
    (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
      IOStub as unknown as typeof IntersectionObserver;
  }

  try {
    const emit = (entries: IntersectionObserverEntry[]) => {
      const cb = lastCallback;
      if (cb) cb(entries, {} as IntersectionObserver);
    };
    return run(emit);
  } finally {
    try {
      Object.defineProperty(globalThis, 'IntersectionObserver', {
        value: original,
        writable: true,
        configurable: true,
      });
    } catch {
      (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = original;
    }
  }
}

describe('PeopleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton on initial loading', () => {
    setHookState({ isPending: true });
    render(<PeopleList search="" />);
    expect(screen.queryByTestId('people-list-skeleton')).toBeTruthy();
    expect(screen.queryByTestId('person-card')).toBeNull();
  });

  it('renders error message', () => {
    setHookState({ isError: true, error: new Error('Boom') });
    render(<PeopleList search="" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/Failed to load people/i);
    expect(screen.getByText(/Boom/i)).toBeInTheDocument();
  });

  it('renders empty state when there are no people', () => {
    setHookState({ data: { pages: [{ results: [] }] }, hasNextPage: false });
    render(<PeopleList search="" />);
    expect(screen.getByText(/No people found\./i)).toBeInTheDocument();
  });

  it('renders people when data is available', () => {
    setHookState({
      data: { pages: [{ results: [{ id: '1', name: 'Luke' }, { id: '2', name: 'Leia' }] }] },
    });
    render(<PeopleList search="" />);
    const cards = screen.getAllByTestId('person-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Luke');
    expect(cards[1]).toHaveTextContent('Leia');
  });

  it('shows Spinner while loading next page', () => {
    setHookState({
      data: { pages: [{ results: [{ id: '1', name: 'Luke' }] }] },
      isFetchingNextPage: true,
      hasNextPage: true,
    });
    render(<PeopleList search="" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows "End of list" when hasNextPage=false', () => {
    setHookState({
      data: { pages: [{ results: [{ id: '1', name: 'Luke' }] }] },
      hasNextPage: false,
    });
    render(<PeopleList search="" />);
    expect(screen.getByText(/End of list/i)).toBeInTheDocument();
  });

  it('calls fetchNextPage when sentinel intersects', () => {
    setHookState({
      data: { pages: [{ results: [{ id: '1', name: 'Luke' }] }] },
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    withIOStub((emit) => {
      render(<PeopleList search="" />);
      emit([{ isIntersecting: true } as IntersectionObserverEntry]);
      expect(fetchNextPageMock).toHaveBeenCalledTimes(1);
    });
  });

  it('does NOT call fetchNextPage when isFetchingNextPage=true', () => {
    setHookState({
      data: { pages: [{ results: [{ id: '1', name: 'Luke' }] }] },
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    withIOStub((emit) => {
      render(<PeopleList search="" />);
      emit([{ isIntersecting: true } as IntersectionObserverEntry]);
      expect(fetchNextPageMock).not.toHaveBeenCalled();
    });
  });
});
