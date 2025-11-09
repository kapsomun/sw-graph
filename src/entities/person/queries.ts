import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPeople } from './api';

// Infinite, paginated fetch of people with optional search filtering
export function usePeopleInfinite(search: string) {
  return useInfiniteQuery({
    // Cache key includes the search term to isolate caches per query
    queryKey: ['people', { search }],

    // Page-aware fetcher; `pageParam` is controlled by React Query
    queryFn: ({ pageParam = 1 }) => fetchPeople(pageParam, search),

    // Starting page for the infinite list
    initialPageParam: 1,

    // Tell React Query how to derive the next page parameter from the API response
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      // API returns a `next` URL (or null). Parse `?page=` from it.
      return lastPage.next
        ? Number(new URL(lastPage.next).searchParams.get('page') ?? lastPageParam + 1)
        : undefined; // `undefined` signals "no more pages"
    },

    // Keep previous page data visible while fetching the next page (reduces UI flicker)
    placeholderData: keepPreviousData,

    // Consider data fresh for 5 minutes to avoid unnecessary refetches
    staleTime: 5 * 60 * 1000,
  });
}
