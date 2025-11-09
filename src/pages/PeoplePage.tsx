import { useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { PeopleList } from '@/features/people-list/PeopleList';

/**
 * PeoplePage
 * -----------
 * Main listing page that shows all Star Wars characters.
 *
 * Features:
 * - Local search input for filtering characters by name.
 * - Debounced input to reduce unnecessary API calls (400ms delay).
 * - Uses <PeopleList /> for infinite scroll and pagination.
 */
export default function PeoplePage() {
  // Local state for search input value
  const [query, setQuery] = useState('');

  // Delay API requests until user stops typing
  const debounced = useDebouncedValue(query, 400);

  return (
    <div className="grid gap-4">
      {/* Search input */}
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people by name…"
          className="w-full max-w-md border rounded-md px-3 py-2"
          aria-label="Search people by name"
        />

        {/* Clear button (visible only when query is non-empty) */}
        {query && (
          <button
            className="border rounded-md px-3 py-2 hover:bg-[rgba(0,209,255,0.08)] transition"
            onClick={() => setQuery('')}
          >
            Clear
          </button>
        )}
      </div>

      {/* List of characters with infinite scroll */}
      <PeopleList search={debounced} />
    </div>
  );
}
