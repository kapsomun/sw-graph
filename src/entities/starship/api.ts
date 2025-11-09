import { http } from '@/shared/lib/http'
import type { Starship } from './types'

// Fetch a single starship by its ID
export async function fetchStarship(id: number) {
  // Retrieve starship data and attach the ID to the response
  const data = await http<Starship & { url: string }>(`/starships/${id}/`)
  return { ...data, id }
}

// Fetch multiple starships concurrently
export async function fetchStarships(ids: number[]) {
  // Execute all requests in parallel and return an array of results
  return Promise.all(ids.map(id => fetchStarship(id)))
}
