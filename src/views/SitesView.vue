<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useSitesStore } from '@/core/stores/storeSites'
import type { Site } from '@/core/types'
import SiteForm from '@/components/SiteForm.vue'

const sitesStore = useSitesStore()
const showForm = ref(false)
const editing = ref<Site | null>(null)
const formError = ref<string | null>(null)

onMounted(() => sitesStore.fetchSites())

const onCreate = () => {
  editing.value = null
  formError.value = null
  showForm.value = true
}

const onEdit = (site: Site) => {
  editing.value = site
  formError.value = null
  showForm.value = true
}

const extractErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object') {
    const messages = Object.values(err.response.data as Record<string, string[]>).flat()
    if (messages.length) return messages.join(' ')
  }
  return "Échec de l'enregistrement du site."
}

const onSubmit = async (payload: Partial<Site>) => {
  formError.value = null
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

  <div v-if="showForm" class="mb-3">
    <SiteForm :initial="editing ?? undefined" @submit="onSubmit" @cancel="showForm = false" />
    <p v-if="formError" class="text-danger small mt-2 mb-0">{{ formError }}</p>
  </div>

  <table class="table table-hover bg-white">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="site in sitesStore.sites" :key="site.id">
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
