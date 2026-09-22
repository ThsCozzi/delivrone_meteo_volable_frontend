<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits<{ select: [lat: number, lon: number, label: string] }>()

interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  admin1?: string
  admin2?: string
  country?: string
}

const query = ref('')
const results = ref<GeocodingResult[]>([])
const loading = ref(false)
const showResults = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Open-Meteo's free, keyless geocoding API — same provider already used for
// weather, indexes towns/cities (not individual businesses or hospitals):
// searching "Cerba l'Aigle" won't match, but "L'Aigle" will. The satellite
// map + draggable marker (shown once coordinates are set) is how the user
// then fine-tunes onto the actual hospital building.
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

const search = async () => {
  const q = query.value.trim()
  if (q.length < 2) {
    results.value = []
    showResults.value = false
    return
  }
  loading.value = true
  try {
    const response = await axios.get<{ results?: GeocodingResult[] }>(GEOCODING_URL, {
      params: { name: q, count: 8, language: 'fr', format: 'json' },
    })
    results.value = response.data.results ?? []
    showResults.value = true
  } catch {
    results.value = []
    showResults.value = true
  } finally {
    loading.value = false
  }
}

const onInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 400)
}

const onFocus = () => {
  if (results.value.length) showResults.value = true
}

// Delayed so a click on a result (see mousedown.prevent below) still
// registers before the dropdown hides.
const onBlur = () => {
  setTimeout(() => (showResults.value = false), 150)
}

const resultLabel = (r: GeocodingResult) => [r.admin2, r.admin1, r.country].filter(Boolean).join(', ')

const onSelect = (r: GeocodingResult) => {
  emit('select', r.latitude, r.longitude, [r.name, resultLabel(r)].filter(Boolean).join(', '))
  query.value = ''
  results.value = []
  showResults.value = false
}
</script>

<template>
  <div class="position-relative">
    <input
      v-model="query"
      type="search"
      class="form-control"
      placeholder="Rechercher une ville pour préremplir les coordonnées..."
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div
      v-if="showResults && results.length"
      class="list-group position-absolute w-100 shadow-sm"
      style="z-index: 1000; max-height: 260px; overflow-y: auto"
    >
      <button
        v-for="r in results"
        :key="r.id"
        type="button"
        class="list-group-item list-group-item-action py-2"
        @mousedown.prevent
        @click="onSelect(r)"
      >
        <div class="fw-semibold">{{ r.name }}</div>
        <div class="small text-muted">{{ resultLabel(r) }}</div>
      </button>
    </div>
    <p v-if="loading" class="text-muted small mt-1 mb-0">Recherche...</p>
    <p v-else-if="showResults && !results.length" class="text-muted small mt-1 mb-0">
      Aucun résultat — essayez le nom de la ville plutôt que l'hôpital, puis ajustez la position sur la carte
      ci-dessous.
    </p>
  </div>
</template>
