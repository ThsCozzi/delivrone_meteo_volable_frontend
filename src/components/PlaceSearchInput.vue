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
// searching "Cerba l'Aigle" returns nothing, and so does any query still
// prefixed with an institution acronym (e.g. "CHU Rouen" — even though
// "Rouen" alone matches fine). stripInstitutionPrefix() strips that prefix
// automatically so typing the facility's actual name (as it's commonly
// written, e.g. "CH Verneuil") still works without the user having to know
// to type just the city. The satellite map + draggable marker (shown once
// coordinates are set) is how the user then fine-tunes onto the actual
// hospital building.
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

// Longest/most-specific first, so e.g. "centre hospitalier universitaire"
// is stripped whole rather than leaving a dangling "universitaire" behind
// after a naive "centre hospitalier" match.
const INSTITUTION_PREFIXES = [
  'centre hospitalier universitaire',
  'centre hospitalier regional',
  'centre hospitalier intercommunal',
  'centre hospitalier',
  'chu',
  'chr',
  'chi',
  'ch',
  'hopital',
  'hôpital',
  'clinique',
  'laboratoire',
]

const stripInstitutionPrefix = (raw: string): string => {
  const trimmed = raw.trim()
  for (const prefix of INSTITUTION_PREFIXES) {
    const match = new RegExp(`^${prefix}\\.?\\s+(de\\s+|d['’]|du\\s+|des\\s+)?`, 'i').exec(trimmed)
    if (match) return trimmed.slice(match[0].length).trim()
  }
  return trimmed
}

const fetchResults = async (name: string): Promise<GeocodingResult[]> => {
  const response = await axios.get<{ results?: GeocodingResult[] }>(GEOCODING_URL, {
    params: { name, count: 8, language: 'fr', format: 'json' },
  })
  return response.data.results ?? []
}

const search = async () => {
  const q = query.value.trim()
  if (q.length < 2) {
    results.value = []
    showResults.value = false
    return
  }
  loading.value = true
  try {
    let found = await fetchResults(q)
    if (!found.length) {
      const stripped = stripInstitutionPrefix(q)
      if (stripped && stripped.toLowerCase() !== q.toLowerCase() && stripped.length >= 2) {
        found = await fetchResults(stripped)
      }
    }
    results.value = found
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
  debounceTimer = setTimeout(search, 300)
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
    <p v-else-if="showResults && !results.length" class="text-danger small mt-1 mb-0">
      Aucune ville trouvée pour "{{ query || '...' }}" — vérifiez l'orthographe, ou saisissez les coordonnées
      manuellement puis ajustez-les sur la carte ci-dessous.
    </p>
  </div>
</template>
