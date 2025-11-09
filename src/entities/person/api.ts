import { http } from '@/shared/lib/http'
import type { Paginated, Person } from './types'

// Extract numeric ID from a resource URL (e.g., "/people/10/")
function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : NaN
}

// Fetch a paginated list of people with optional search query
export async function fetchPeople(page = 1, search = '') {
  const q = new URLSearchParams()
  q.set('page', String(page))
  if (search) q.set('search', search)

  // Get paginated data from the API
  const data = await http<Paginated<Person & { url: string }>>(`/people/?${q.toString()}`)

  // Normalize results by extracting IDs from URLs
  const results = data.results.map(p => ({ ...p, id: extractIdFromUrl(p.url) }))

  return { ...data, results }
}

// Fetch a single person by ID
export async function fetchPerson(id: number) {
  const data = await http<Person & { url: string }>(`/people/${id}/`)
  return { ...data, id }
}
