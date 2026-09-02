<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Drone } from '@/core/types'

const props = defineProps<{ loading: boolean; drones: Drone[]; defaultDroneId: number | null }>()
const emit = defineEmits<{
  run: [startDate: string, endDate: string, droneId: number | null, batteryId: number | null]
}>()

// Open-Meteo's archive has a data-availability lag, so the latest usable
// end date is a few days behind today — default to 10 days back, and cap
// the date picker there too. Default analysis window: 2 years.
const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const maxEndDate = new Date()
maxEndDate.setDate(maxEndDate.getDate() - 10)

const defaultStartDate = new Date(maxEndDate)
defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 2)

const maxEndDateIso = toIsoDate(maxEndDate)
const startDate = ref(toIsoDate(defaultStartDate))
const endDate = ref(maxEndDateIso)

const droneId = ref<number | null>(props.defaultDroneId)
const batteryId = ref<number | null>(null)

const selectedDroneBatteries = computed(() => {
  const selectedDrone = props.drones.find((d) => d.id === droneId.value)
  return selectedDrone?.batteries ?? []
})

const setDefaultBattery = () => {
  const defaultBattery = selectedDroneBatteries.value.find((b) => b.is_default) ?? selectedDroneBatteries.value[0]
  batteryId.value = defaultBattery ? defaultBattery.id : null
}

watch(() => props.defaultDroneId, (id) => (droneId.value = id))
watch(droneId, setDefaultBattery, { immediate: true })

const onRun = () => emit('run', startDate.value, endDate.value, droneId.value, batteryId.value)
</script>

<template>
  <div class="card p-3 mb-3">
    <div class="row g-2 align-items-end">
      <div class="col-md-3">
        <label class="form-label">Du</label>
        <input v-model="startDate" type="date" class="form-control" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Au</label>
        <input v-model="endDate" type="date" class="form-control" :max="maxEndDateIso" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Drone</label>
        <select v-model.number="droneId" class="form-select">
          <option v-for="d in props.drones" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Batterie</label>
        <select v-model.number="batteryId" class="form-select">
          <option v-for="battery in selectedDroneBatteries" :key="battery.id" :value="battery.id">
            {{ battery.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="mt-2">
      <button class="btn btn-primary" :disabled="props.loading" @click="onRun">
        {{ props.loading ? 'Analyse en cours...' : "Lancer l'analyse" }}
      </button>
    </div>
  </div>
</template>
