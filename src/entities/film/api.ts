import { http } from '@/shared/lib/http';
import type { Film } from './types';

// Fetch a single film by ID from the API
export async function fetchFilm(id: number) {
  // Retrieve film data and include the film ID in the returned object
  const data = await http<Film & { url: string }>(`/films/${id}/`);
  return { ...data, id };
}

// Fetch multiple films in parallel using Promise.all
export async function fetchFilms(ids: number[]) {
  // Return an empty array if there are no film IDs to fetch
  if (!ids.length) return [];
  return Promise.all(ids.map((id) => fetchFilm(id)));
}
