<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDronesStore } from '@/core/stores/storeDrones'
import type { Drone } from '@/core/types'
import DroneForm from '@/components/DroneForm.vue'

const dronesStore = useDronesStore()
const showForm = ref(false)
const editing = ref<Drone | null>(null)

onMounted(() => dronesStore.fetchDrones())

const onCreate = () => {
  editing.value = null
  showForm.value = true
}

const onEdit = (drone: Drone) => {
  editing.value = drone
  showForm.value = true
}

const onSubmit = async (payload: Partial<Drone>) => {
  if (editing.value) {
    await dronesStore.editDrone(editing.value.id, payload)
  } else {
    await dronesStore.addDrone(payload)
  }
  showForm.value = false
}
</script>

<template>
  <div class="view-toolbar d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-0">Drones</h1>
    <button class="btn btn-primary btn-sm" @click="onCreate">+ Nouveau drone</button>
  </div>

  <DroneForm v-if="showForm" :initial="editing ?? undefined" class="mb-3" @submit="onSubmit" @cancel="showForm = false" />

  <div class="row g-3">
    <div v-for="drone in dronesStore.drones" :key="drone.id" class="col-md-4">
      <div class="card p-3">
        <h2 class="h6">
          {{ drone.name }}
          <span v-if="drone.is_default" class="badge bg-primary ms-1">défaut</span>
        </h2>
        <ul class="list-unstyled small text-muted mb-2">
          <li>Vent max: {{ drone.wind_limit_ms }} m/s</li>
          <li>Pluie max: {{ drone.rain_limit_mmh }} mm/h</li>
          <li>Temp: {{ drone.temp_min_c }}°C à {{ drone.temp_max_c }}°C</li>
          <li>Batterie: {{ drone.battery_capacity_ah }} Ah</li>
        </ul>
        <button class="btn btn-sm btn-outline-secondary" @click="onEdit(drone)">Modifier</button>
      </div>
    </div>
  </div>
</template>
