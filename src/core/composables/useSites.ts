import axios from 'axios'
import type { Paginated, Site } from '@/core/types'

export function useSites() {
  const listSites = async (): Promise<Site[]> => {
    const response = await axios.get<Paginated<Site>>('/api/sites')
    return response.data.results
  }

  const createSite = async (payload: Partial<Site>): Promise<Site> => {
    const response = await axios.post<Site>('/api/sites', payload)
    return response.data
  }

  const updateSite = async (id: number, payload: Partial<Site>): Promise<Site> => {
    const response = await axios.patch<Site>(`/api/sites/${id}`, payload)
    return response.data
  }

  const deleteSite = async (id: number): Promise<void> => {
    await axios.delete(`/api/sites/${id}`)
  }

  return { listSites, createSite, updateSite, deleteSite }
}
