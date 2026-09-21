import axios from 'axios'
import type { BatteryBudget, FlyabilityResult, Paginated, Route } from '@/core/types'

export function useRoutes() {
  const listRoutes = async (): Promise<Route[]> => {
    const response = await axios.get<Paginated<Route>>('/api/routes')
    return response.data.results
  }

  const getRoute = async (id: number): Promise<Route> => {
    const response = await axios.get<Route>(`/api/routes/${id}`)
    return response.data
  }

  const createRoute = async (payload: Partial<Route>): Promise<Route> => {
    const response = await axios.post<Route>('/api/routes', payload)
    return response.data
  }

  const updateRoute = async (id: number, payload: Partial<Route>): Promise<Route> => {
    const response = await axios.patch<Route>(`/api/routes/${id}`, payload)
    return response.data
  }

  const deleteRoute = async (id: number): Promise<void> => {
    await axios.delete(`/api/routes/${id}`)
  }

  const computeFlyability = async (
    id: number,
    startDate: string,
    endDate: string,
    droneId?: number | null,
    batteryId?: number | null
  ): Promise<FlyabilityResult> => {
    const response = await axios.post<FlyabilityResult>(`/api/routes/${id}/compute`, {
      start_date: startDate,
      end_date: endDate,
      drone: droneId ?? null,
      battery: batteryId ?? null,
    })
    return response.data
  }

  const computeAllBatteries = async (
    id: number,
    startDate: string,
    endDate: string,
    droneId?: number | null
  ): Promise<FlyabilityResult[]> => {
    const response = await axios.post<FlyabilityResult[]>(`/api/routes/${id}/compute-all-batteries`, {
      start_date: startDate,
      end_date: endDate,
      drone: droneId ?? null,
    })
    return response.data
  }

  const listResults = async (id: number): Promise<FlyabilityResult[]> => {
    const response = await axios.get<Paginated<FlyabilityResult>>(`/api/routes/${id}/results`)
    return response.data.results
  }

  const getBatteryBudget = async (id: number, droneId?: number | null): Promise<BatteryBudget[]> => {
    const response = await axios.get<BatteryBudget[]>(`/api/routes/${id}/battery-budget`, {
      params: droneId ? { drone: droneId } : undefined,
    })
    return response.data
  }

  return {
    listRoutes,
    getRoute,
    createRoute,
    updateRoute,
    deleteRoute,
    computeFlyability,
    computeAllBatteries,
    listResults,
    getBatteryBudget,
  }
}
