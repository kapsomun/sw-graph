import { useEffect, useRef } from "react";

import { usePeopleInfinite } from "@/entities/person/queries";
import PersonCard from "./PersonCard";
import { PeopleListSkeleton } from "./PeopleListSkeleton";
import { Spinner } from "@/shared/ui/Spinner";

export function PeopleList({ search }: { search: string }) {
  // Infinite query hook that handles paging, caching and network state
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = usePeopleInfinite(search);

  // Sentinel element used by IntersectionObserver to trigger loading next page
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    // Start observing when the sentinel approaches the viewport bottom
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        // Load next page only if:
        // - sentinel is visible,
        // - server indicates there is another page,
        // - no ongoing "next page" request
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px 0px" } // prefetch earlier to avoid visible gaps while scrolling
    );

    io.observe(el);
    return () => io.disconnect(); // cleanup on unmount or when deps change
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Initial loading skeleton (prevents layout shift and flicker)
  if (isPending) return <PeopleListSkeleton />;

  // Basic error boundary for the list
  if (isError)
    return (
      <div role="alert" className="text-red-600">
        Failed to load people: {error?.message ?? "Unknown error"}
      </div>
    );

  // Flatten pages into a single array
  const people = data?.pages.flatMap((p) => p.results) ?? [];

  // Empty state for search/no data
  if (people.length === 0)
    return <div className="opacity-70">No people found.</div>;

  return (
    <div className="grid gap-3">
      {/* Responsive grid of person cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </div>

      {/* Observer target (must be rendered after the list) */}
      <div ref={sentinelRef} />

      {/* In-flight indicator for "load more" */}
      {isFetchingNextPage && <Spinner />}

      {/* Explicit end-of-list marker to improve UX */}
      {!hasNextPage && (
        <div className="opacity-60 text-sm text-center py-3">
          • End of list •
        </div>
      )}
    </div>
  );
}
