<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoutes } from '@/core/composables/useRoutes'
import { useResultsStore } from '@/core/stores/storeResults'
import type { Route } from '@/core/types'
import RouteAnalysisPanel from '@/components/RouteAnalysisPanel.vue'
import FlyabilityResultsDashboard from '@/components/FlyabilityResultsDashboard.vue'

const props = defineProps<{ id: string }>()

const { getRoute } = useRoutes()
const resultsStore = useResultsStore()

const route = ref<Route | null>(null)

onMounted(async () => {
  route.value = await getRoute(Number(props.id))
  await resultsStore.fetchHistory(Number(props.id))
})

const onRun = (startDate: string, endDate: string) => {
  resultsStore.runAnalysis(Number(props.id), startDate, endDate)
}
</script>

<template>
  <div v-if="route">
    <h1 class="h4">{{ route.name }}</h1>
    <p class="text-muted">
      {{ route.origin_detail?.name }} ↔ {{ route.destination_detail?.name }} —
      {{ Number(route.distance_km_outbound).toFixed(1) }} km — cap
      {{ Number(route.bearing_deg_outbound).toFixed(0) }}° / {{ Number(route.bearing_deg_return).toFixed(0) }}°
    </p>

    <RouteAnalysisPanel :loading="resultsStore.status === 'LOADING'" @run="onRun" />

    <p v-if="resultsStore.status === 'ERROR'" class="text-danger">{{ resultsStore.errorMessage }}</p>
    <FlyabilityResultsDashboard v-if="resultsStore.currentResult" :result="resultsStore.currentResult" />
    <p v-else-if="resultsStore.status !== 'LOADING'" class="text-muted">
      Aucune analyse pour le moment — choisissez une période et lancez l'analyse.
    </p>
  </div>
</template>
