import { useQuery } from '@tanstack/react-query';
import { fetchPerson } from '@/entities/person/api';
import { fetchFilms } from '@/entities/film/api';
import { fetchStarships } from '@/entities/starship/api';

type GraphStarship = { id: number; name: string };
type GraphFilm = { id: number; title: string; starships: GraphStarship[] };

export type PersonGraphData = {
  person: { id: number; name: string };
  films: GraphFilm[];
};

/**
 * Hook that builds the domain-specific graph data for a single person:
 * person → films → (intersected) starships the person actually traveled on in each film.
 *
 * Notes:
 * - We intentionally keep films even when `starships` is empty to preserve the
 *   person→film relationship on the graph (UI will render dashed film nodes).
 * - All fetching happens inside one query to avoid cascading network waterfalls.
 * - Results are cached by `id` for 5 minutes (staleTime).
 */
export default function usePersonGraphData(id: number) {
  return useQuery<PersonGraphData>({
    // Stable cache key per person
    queryKey: ['person-graph', id],

    // Single orchestrated fetch that composes person, films, and starships
    queryFn: async () => {
      // 1) Fetch the person (provides film ids + starship ids)
      const person = await fetchPerson(id);

      // 2) Fetch all films the person appears in (in parallel)
      const films = await fetchFilms(person.films);

      // 3) For each film, compute intersection of film.starships ∩ person.starships
      //    and accumulate unique starship ids to batch-fetch later.
      const shipsNeeded = new Set<number>();
      const filmToShips = new Map<number, number[]>();

      for (const f of films) {
        const intersect = f.starships.filter((sid) => person.starships.includes(sid));
        filmToShips.set(f.id, intersect);
        intersect.forEach((sid) => shipsNeeded.add(sid));
      }

      // 4) Fetch only the unique starships we actually need (if any),
      //    then map them by id for quick lookup.
      const shipsArr = shipsNeeded.size ? await fetchStarships([...shipsNeeded]) : [];
      const shipsMap = new Map(shipsArr.map((s) => [s.id, s]));

      // 5) Build the final graph films payload with populated starship objects
      const graphFilms: GraphFilm[] = films.map((f) => ({
        id: f.id,
        title: f.title,
        starships: (filmToShips.get(f.id) ?? [])
          .map((sid) => shipsMap.get(sid))
          .filter(Boolean)
          .map((s) => ({ id: s!.id, name: s!.name })),
      }));

      // 6) Return normalized graph data
      return {
        person: { id: person.id, name: person.name },
        films: graphFilms, // keep films even when `starships.length === 0`
      };
    },

    // Keep data fresh-but-not-eagerly-refetched for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
