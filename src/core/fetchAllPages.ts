import axios from 'axios'
import type { Paginated } from '@/core/types'

// The API paginates list endpoints at 50 items per page (see
// RelativeURLPagination). Reading only `results` from the first page
// silently drops anything past item 50 — with 95 sites already in
// production, this meant a freshly created site could disappear the moment
// the page was reloaded and the list re-fetched, simply because it sorted
// past the cutoff (e.g. "CHU Rouen" landed at position 52). Every list
// endpoint must walk `next` until exhausted instead of trusting a single
// page's `results`.
export async function fetchAllPages<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let next: string | null = url
  while (next) {
    const response = await axios.get<Paginated<T>>(next)
    results.push(...response.data.results)
    next = response.data.next
  }
  return results
}
