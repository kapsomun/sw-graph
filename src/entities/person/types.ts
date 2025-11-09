export type Person = {
  id: number           // витягуємо з url
  name: string
  films: number[]
  starships: number[]
  url: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
