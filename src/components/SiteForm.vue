<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Site } from '@/core/types'
import SiteMap from '@/components/SiteMap.vue'

const props = defineProps<{ initial?: Partial<Site> }>()
const emit = defineEmits<{ submit: [payload: Partial<Site>]; cancel: [] }>()

const blank: Partial<Site> = { name: '', latitude: '', longitude: '', is_active: true }
const form = reactive<Partial<Site>>({ ...blank, ...props.initial })

watch(
  () => props.initial,
  (value) => Object.assign(form, blank, value ?? {})
)

const onSubmit = () => emit('submit', { ...form })

const hasValidCoords = computed(() => {
  const lat = parseFloat(String(form.latitude ?? ''))
  const lon = parseFloat(String(form.longitude ?? ''))
  return Number.isFinite(lat) && Number.isFinite(lon)
})

const onMarkerMoved = (lat: number, lon: number) => {
  form.latitude = lat.toFixed(6)
  form.longitude = lon.toFixed(6)
}
</script>

<template>
  <form class="card p-3" @submit.prevent="onSubmit">
    <div class="row g-2 align-items-end">
      <div class="col-md-4">
        <label class="form-label">Nom</label>
        <input v-model="form.name" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Latitude</label>
        <input v-model="form.latitude" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Longitude</label>
        <input v-model="form.longitude" class="form-control" required />
      </div>
      <div class="col-md-2">
        <button class="btn btn-success w-100" type="submit">Enregistrer</button>
      </div>
    </div>

    <div v-if="hasValidCoords" class="mt-3">
      <label class="form-label small text-muted">Vue satellite (1 km x 1 km) — pour confirmer la position</label>
      <SiteMap :latitude="form.latitude!" :longitude="form.longitude!" @moved="onMarkerMoved" />
    </div>

    <button class="btn btn-link mt-1 p-0" type="button" @click="emit('cancel')">Annuler</button>
  </form>
</template>
