import axios from 'axios'
import type { Battery } from '@/core/types'

export function useBatteries() {
  const createBattery = async (payload: Partial<Battery>): Promise<Battery> => {
    const response = await axios.post<Battery>('/api/batteries', payload)
    return response.data
  }

  const updateBattery = async (id: number, payload: Partial<Battery>): Promise<Battery> => {
    const response = await axios.patch<Battery>(`/api/batteries/${id}`, payload)
    return response.data
  }

  const deleteBattery = async (id: number): Promise<void> => {
    await axios.delete(`/api/batteries/${id}`)
  }

  return { createBattery, updateBattery, deleteBattery }
}
