<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoutes } from '@/core/composables/useRoutes'
import { useResultsStore } from '@/core/stores/storeResults'
import { useDronesStore } from '@/core/stores/storeDrones'
import type { Route } from '@/core/types'
import RouteAnalysisPanel from '@/components/RouteAnalysisPanel.vue'
import FlyabilityResultsDashboard from '@/components/FlyabilityResultsDashboard.vue'

const props = defineProps<{ id: string }>()

const { getRoute, updateRoute } = useRoutes()
const resultsStore = useResultsStore()
const dronesStore = useDronesStore()

const route = ref<Route | null>(null)
const profileForm = reactive({
  mcOrigin: '0.1',
  mcDestination: '0.1',
  fwIsCustom: false,
  fwDistance: '0',
})
const savingProfile = ref(false)

onMounted(async () => {
  const [fetchedRoute] = await Promise.all([
    getRoute(Number(props.id)),
    resultsStore.fetchHistory(Number(props.id)),
    dronesStore.fetchDrones(),
  ])
  route.value = fetchedRoute
  profileForm.mcOrigin = fetchedRoute.mc_distance_km_origin
  profileForm.mcDestination = fetchedRoute.mc_distance_km_destination
  profileForm.fwIsCustom = fetchedRoute.fw_distance_km !== null
  profileForm.fwDistance = fetchedRoute.fw_distance_km ?? fetchedRoute.resolved_fw_distance_km
})

const saveProfile = async () => {
  savingProfile.value = true
  try {
    route.value = await updateRoute(Number(props.id), {
      mc_distance_km_origin: profileForm.mcOrigin,
      mc_distance_km_destination: profileForm.mcDestination,
      fw_distance_km: profileForm.fwIsCustom ? profileForm.fwDistance : null,
    })
    profileForm.fwDistance = route.value.fw_distance_km ?? route.value.resolved_fw_distance_km
  } finally {
    savingProfile.value = false
  }
}

const onSaveProfile = () => saveProfile()

// The analysis is computed server-side from the route's saved profile
// (MC/FW distances), not from whatever is currently typed in the form — so
// save first, otherwise a change made just before clicking "Lancer
// l'analyse" would silently be ignored.
const onRun = async (startDate: string, endDate: string, droneId: number | null, batteryId: number | null) => {
  await saveProfile()
  resultsStore.runAnalysis(Number(props.id), startDate, endDate, droneId, batteryId)
}
</script>

<template>
  <div v-if="route">
    <h1 class="h4">{{ route.name }}</h1>
    <p class="text-muted">
      {{ route.origin_detail?.name }} ↔ {{ route.destination_detail?.name }} —
      {{ Number(route.distance_km_outbound).toFixed(1) }} km à vol d'oiseau — cap
      {{ Number(route.bearing_deg_outbound).toFixed(0) }}° / {{ Number(route.bearing_deg_return).toFixed(0) }}°
    </p>

    <div class="card p-3 mb-3">
      <h2 class="h6">Profil de mission</h2>
      <p class="text-muted small">
        Portion de chaque côté volée en mode multicoptère (avant/après la croisière en voilure fixe), et
        distance réellement parcourue en voilure fixe — utile si la ligne n'est pas directe (contournement
        d'obstacle, zone interdite...). Ces réglages s'appliquent à la ligne, pas à une analyse en particulier.
      </p>
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label">MC côté {{ route.origin_detail?.name }} (km)</label>
          <input v-model="profileForm.mcOrigin" class="form-control" />
        </div>
        <div class="col-md-4">
          <label class="form-label">MC côté {{ route.destination_detail?.name }} (km)</label>
          <input v-model="profileForm.mcDestination" class="form-control" />
        </div>
      </div>

      <div class="mt-3">
        <div class="form-check">
          <input
            id="fwIsCustom"
            v-model="profileForm.fwIsCustom"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="fwIsCustom">
            Distance voilure fixe personnalisée (trajet non direct)
          </label>
        </div>
        <div class="row g-2 align-items-end mt-1">
          <div class="col-md-4">
            <label class="form-label">Distance voilure fixe (km)</label>
            <input v-model="profileForm.fwDistance" class="form-control" :disabled="!profileForm.fwIsCustom" />
            <div class="form-text" v-if="!profileForm.fwIsCustom">
              Calculée automatiquement : {{ Number(route.resolved_fw_distance_km).toFixed(2) }} km
              (vol d'oiseau moins les 2 segments multicoptère)
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3">
        <button class="btn btn-outline-primary" :disabled="savingProfile" @click="onSaveProfile">
          Enregistrer
        </button>
      </div>
    </div>

    <p v-if="!dronesStore.drones.length" class="text-danger small">
      Aucun drone configuré — ajoutez-en un dans la page Drones avant de lancer une analyse.
    </p>
    <RouteAnalysisPanel
      v-else
      :loading="resultsStore.status === 'LOADING'"
      :drones="dronesStore.drones"
      :default-drone-id="route.resolved_drone?.id ?? null"
      @run="onRun"
    />

    <p v-if="resultsStore.status === 'ERROR'" class="text-danger">{{ resultsStore.errorMessage }}</p>
    <FlyabilityResultsDashboard v-if="resultsStore.currentResult" :result="resultsStore.currentResult" />
    <p v-else-if="resultsStore.status !== 'LOADING'" class="text-muted">
      Aucune analyse pour le moment — choisissez une période et lancez l'analyse.
    </p>
  </div>
</template>
