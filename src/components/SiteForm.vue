<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Site } from '@/core/types'
import SiteMap from '@/components/SiteMap.vue'

const props = defineProps<{ initial?: Partial<Site> }>()
const emit = defineEmits<{ submit: [payload: Partial<Site>]; cancel: [] }>()

const blank: Partial<Site> = { name: '', latitude: '', longitude: '', is_active: true }
const form = reactive<Partial<Site>>({ ...blank, ...props.initial })

const hasValidCoords = computed(() => {
  const lat = parseFloat(String(form.latitude ?? ''))
  const lon = parseFloat(String(form.longitude ?? ''))
  return Number.isFinite(lat) && Number.isFinite(lon)
})

// Once shown, the map stays mounted even through a momentarily invalid
// value while editing (e.g. deleting a "." before typing a ","). Gating on
// hasValidCoords directly would tear down and recreate the whole Leaflet
// map on every such keystroke — fast typing/deleting can fire enough of
// these create/destroy cycles in a row to hang the tab.
const mapVisible = ref(hasValidCoords.value)
watch(hasValidCoords, (valid) => {
  if (valid) mapVisible.value = true
})

watch(
  () => props.initial,
  (value) => {
    Object.assign(form, blank, value ?? {})
    mapVisible.value = hasValidCoords.value
  }
)

// The backend stores coordinates with exactly 6 decimal places
// (DecimalField(max_digits=9, decimal_places=6)) and rejects anything more
// precise. Coordinates pasted from Google Maps etc. often carry far more
// decimals, so round here — the same rounding onMarkerMoved already applies
// when the red dot is dragged — instead of forwarding the raw typed value
// and letting the save fail.
const onSubmit = () => {
  const lat = parseFloat(String(form.latitude ?? ''))
  const lon = parseFloat(String(form.longitude ?? ''))
  emit('submit', {
    ...form,
    latitude: Number.isFinite(lat) ? lat.toFixed(6) : form.latitude,
    longitude: Number.isFinite(lon) ? lon.toFixed(6) : form.longitude,
  })
}

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

    <div v-if="mapVisible" class="mt-3">
      <label class="form-label small text-muted">Vue satellite (1 km x 1 km) — pour confirmer la position</label>
      <SiteMap :latitude="form.latitude!" :longitude="form.longitude!" @moved="onMarkerMoved" />
    </div>

    <button class="btn btn-link mt-1 p-0" type="button" @click="emit('cancel')">Annuler</button>
  </form>
</template>
