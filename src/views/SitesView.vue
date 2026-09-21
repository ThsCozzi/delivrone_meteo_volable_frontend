<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import axios from 'axios'
import { useSitesStore } from '@/core/stores/storeSites'
import type { Site } from '@/core/types'
import SiteForm from '@/components/SiteForm.vue'

const sitesStore = useSitesStore()
const showForm = ref(false)
const editing = ref<Site | null>(null)
const formError = ref<string | null>(null)
const formSection = ref<HTMLElement | null>(null)

const searchQuery = ref('')
const filteredSites = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return sitesStore.sites
  return sitesStore.sites.filter((s) => s.name.toLowerCase().includes(query))
})

onMounted(() => sitesStore.fetchSites())

const scrollToForm = () => {
  nextTick(() => formSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

const onCreate = () => {
  editing.value = null
  formError.value = null
  showForm.value = true
  scrollToForm()
}

const onEdit = (site: Site) => {
  editing.value = site
  formError.value = null
  showForm.value = true
  scrollToForm()
}

const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
    const messages = Object.values(err.response.data as Record<string, string[]>).flat()
    if (messages.length) return messages.join(' ')
  }
  return "Échec de l'enregistrement du site."
}

// Distance in meters between two lat/lon points (haversine) — used to warn
// about a likely duplicate site, e.g. the same hospital re-entered under a
// slightly different name or with coordinates copied a second time.
const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

const findLikelyDuplicate = (payload: Partial<Site>): Site | null => {
  const name = (payload.name ?? '').trim().toLowerCase()
  const lat = parseFloat(String(payload.latitude ?? ''))
  const lon = parseFloat(String(payload.longitude ?? ''))

  return (
    sitesStore.sites.find((existing) => {
      if (existing.name.trim().toLowerCase() === name) return true
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return distanceMeters(lat, lon, Number(existing.latitude), Number(existing.longitude)) < 50
      }
      return false
    }) ?? null
  )
}

const onSubmit = async (payload: Partial<Site>) => {
  formError.value = null

  if (!editing.value) {
    const duplicate = findLikelyDuplicate(payload)
    if (duplicate) {
      const confirmed = window.confirm(
        `Un site très proche existe déjà : "${duplicate.name}" (${duplicate.latitude}, ${duplicate.longitude}).\n\n` +
          'Créer quand même un nouveau site ?'
      )
      if (!confirmed) return
    }
  }

  try {
    if (editing.value) {
      await sitesStore.editSite(editing.value.id, payload)
    } else {
      await sitesStore.addSite(payload)
    }
    showForm.value = false
  } catch (err) {
    formError.value = extractErrorMessage(err)
  }
}
</script>

<template>
  <div class="view-toolbar d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-0">Sites</h1>
    <button class="btn btn-primary btn-sm" @click="onCreate">+ Nouveau site</button>
  </div>

  <div v-if="showForm" ref="formSection" class="mb-3">
    <SiteForm :initial="editing ?? undefined" @submit="onSubmit" @cancel="showForm = false" />
    <p v-if="formError" class="text-danger small mt-2 mb-0">{{ formError }}</p>
  </div>

  <div class="mb-3" style="max-width: 400px">
    <input v-model="searchQuery" type="search" class="form-control" placeholder="Rechercher un site..." />
  </div>

  <p v-if="!filteredSites.length" class="text-muted">Aucun site ne correspond à la recherche.</p>
  <table v-else class="table table-hover bg-white">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="site in filteredSites" :key="site.id">
        <td>{{ site.name }}</td>
        <td>{{ site.latitude }}</td>
        <td>{{ site.longitude }}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" @click="onEdit(site)">Modifier</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
