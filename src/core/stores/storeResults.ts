import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoutes } from '@/core/composables/useRoutes'
import type { FlyabilityResult } from '@/core/types'

export const useResultsStore = defineStore('results', () => {
  const { computeFlyability, listResults } = useRoutes()

  const currentResult = ref<FlyabilityResult | null>(null)
  const history = ref<FlyabilityResult[]>([])
  const status = ref<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const errorMessage = ref<string | null>(null)

  const runAnalysis = async (routeId: number, startDate: string, endDate: string): Promise<void> => {
    status.value = 'LOADING'
    errorMessage.value = null
    try {
      currentResult.value = await computeFlyability(routeId, startDate, endDate)
      history.value = [currentResult.value, ...history.value]
      status.value = 'SUCCESS'
    } catch (error: any) {
      status.value = 'ERROR'
      errorMessage.value = error?.response?.data?.detail || error.message
    }
  }

  const fetchHistory = async (routeId: number): Promise<void> => {
    history.value = await listResults(routeId)
    currentResult.value = history.value[0] ?? null
  }

  return { currentResult, history, status, errorMessage, runAnalysis, fetchHistory }
})
