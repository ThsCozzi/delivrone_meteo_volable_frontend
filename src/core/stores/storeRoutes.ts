import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoutes } from '@/core/composables/useRoutes'
import type { Route } from '@/core/types'

export const useRoutesStore = defineStore('routes', () => {
  const { listRoutes, createRoute, updateRoute, deleteRoute } = useRoutes()

  const routes = ref<Route[]>([])
  const status = ref<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const errorMessage = ref<string | null>(null)

  const fetchRoutes = async (): Promise<void> => {
    status.value = 'LOADING'
    try {
      routes.value = await listRoutes()
      status.value = 'SUCCESS'
    } catch (error) {
      status.value = 'ERROR'
      errorMessage.value = (error as Error).message
    }
  }

  const addRoute = async (payload: Partial<Route>): Promise<Route> => {
    const created = await createRoute(payload)
    routes.value.push(created)
    return created
  }

  const editRoute = async (id: number, payload: Partial<Route>): Promise<void> => {
    const updated = await updateRoute(id, payload)
    const index = routes.value.findIndex((r) => r.id === id)
    if (index !== -1) routes.value[index] = updated
  }

  const removeRoute = async (id: number): Promise<void> => {
    await deleteRoute(id)
    routes.value = routes.value.filter((r) => r.id !== id)
  }

  return { routes, status, errorMessage, fetchRoutes, addRoute, editRoute, removeRoute }
})
