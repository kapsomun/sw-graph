import { useParams, Link } from "react-router-dom";
import usePersonGraphData from "@/features/person-details/usePersonGraphData";

import { PersonGraph } from "@/features/person-details/PersonGraph";
import { PersonDetailsSkeleton } from "@/features/person-details/PersonDetailsSkeleton";

/**
 * PersonDetailsPage
 * -----------------
 * Displays detailed information about a specific Star Wars character,
 * including a relationship graph of films and starships.
 *
 * - Fetches character data from the API using React Query.
 * - Handles loading and error states with skeletons and alerts.
 * - Renders both an interactive graph and a fallback list view.
 */
export default function PersonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);
  const { data, isPending, isError, error } = usePersonGraphData(personId);

  // Guard: invalid route param
  if (Number.isNaN(personId))
    return <div className="text-red-600">Invalid person id.</div>;

  // Loading state with skeleton UI
  if (isPending) return <PersonDetailsSkeleton />;

  // Error state
  if (isError) {
    return (
      <div role="alert" className="text-red-600">
        Failed to load person: {error?.message ?? "Unknown error"}
      </div>
    );
  }

  // Guard: no data received
  if (!data) return null;

  return (
    <div className="grid gap-4">
      {/* Header section with back button */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="border rounded-md px-3 py-2 hover:bg-[rgba(0,209,255,0.08)]"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">{data.person.name}</h1>
      </div>

      {/* Interactive graph visualization */}
      <section className="grid gap-2">
        <h2 className="font-medium">Graph</h2>
        <PersonGraph data={data} />
      </section>

      {/* Fallback list view (for accessibility or no-graph mode) */}
      <section className="grid gap-3">
        <h2 className="font-semibold">Films & Starships</h2>
        <ul className="flex flex-col gap-2 mt-1">
          {data.films.map((f) => (
            <li
              key={f.id}
              className="border rounded-md p-3 hover:bg-[rgba(0,209,255,0.08)] transition-transform sw-panel"
            >
              <div className="font-medium">{f.title}</div>

              {/* Show message if no ships are linked */}
              {f.starships.length === 0 ? (
                <div className="text-sm opacity-70 mt-1">
                  No starships for this character in this film.
                </div>
              ) : (
                <>
                  <div className="text-sm opacity-70 mt-1">Starships:</div>
                  <ul className="flex flex-wrap gap-2 mt-1">
                    {f.starships.map((s) => (
                      <li
                        key={s.id}
                        className="px-2 py-1 text-sm border rounded-md"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
