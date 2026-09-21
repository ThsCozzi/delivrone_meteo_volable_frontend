import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoutes } from '@/core/composables/useRoutes'
import type { FlyabilityResult } from '@/core/types'

export const useResultsStore = defineStore('results', () => {
  const { computeAllBatteries, listResults } = useRoutes()

  // The most recent batch of results (one per battery of the analysed
  // drone), all computed from a single weather fetch.
  const batteryResults = ref<FlyabilityResult[]>([])
  // Which of batteryResults is currently shown in the detail dashboard.
  const currentResult = ref<FlyabilityResult | null>(null)
  const history = ref<FlyabilityResult[]>([])
  const status = ref<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const errorMessage = ref<string | null>(null)

  const selectResult = (result: FlyabilityResult) => {
    currentResult.value = result
  }

  const runAnalysis = async (
    routeId: number,
    startDate: string,
    endDate: string,
    droneId?: number | null
  ): Promise<void> => {
    status.value = 'LOADING'
    errorMessage.value = null
    try {
      const results = await computeAllBatteries(routeId, startDate, endDate, droneId)
      batteryResults.value = results
      // The backend computes the drone's default battery last (freshest
      // computed_at), so it's the last entry here too — open the detail
      // dashboard on it, since that's the pack Delivrone actually flies by
      // default.
      currentResult.value = results[results.length - 1] ?? null
      history.value = [...results, ...history.value]
      status.value = 'SUCCESS'
    } catch (error: any) {
      status.value = 'ERROR'
      errorMessage.value = error?.response?.data?.detail || error.message
    }
  }

  const fetchHistory = async (routeId: number): Promise<void> => {
    history.value = await listResults(routeId)
    currentResult.value = history.value[0] ?? null
    batteryResults.value = []
  }

  return {
    currentResult,
    batteryResults,
    history,
    status,
    errorMessage,
    runAnalysis,
    fetchHistory,
    selectResult,
  }
})
