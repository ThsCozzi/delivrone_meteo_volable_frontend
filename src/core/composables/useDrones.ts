import axios from 'axios'
import type { Drone, Paginated } from '@/core/types'

export function useDrones() {
  const listDrones = async (): Promise<Drone[]> => {
    const response = await axios.get<Paginated<Drone>>('/api/drones')
    return response.data.results
  }

  const getDrone = async (id: number): Promise<Drone> => {
    const response = await axios.get<Drone>(`/api/drones/${id}`)
    return response.data
  }

  const createDrone = async (payload: Partial<Drone>): Promise<Drone> => {
    const response = await axios.post<Drone>('/api/drones', payload)
    return response.data
  }

  const updateDrone = async (id: number, payload: Partial<Drone>): Promise<Drone> => {
    const response = await axios.patch<Drone>(`/api/drones/${id}`, payload)
    return response.data
  }

  const deleteDrone = async (id: number): Promise<void> => {
    await axios.delete(`/api/drones/${id}`)
  }

  return { listDrones, getDrone, createDrone, updateDrone, deleteDrone }
}
