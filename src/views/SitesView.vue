<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSitesStore } from '@/core/stores/storeSites'
import type { Site } from '@/core/types'
import SiteForm from '@/components/SiteForm.vue'

const sitesStore = useSitesStore()
const showForm = ref(false)
const editing = ref<Site | null>(null)

onMounted(() => sitesStore.fetchSites())

const onCreate = () => {
  editing.value = null
  showForm.value = true
}

const onEdit = (site: Site) => {
  editing.value = site
  showForm.value = true
}

const onSubmit = async (payload: Partial<Site>) => {
  if (editing.value) {
    await sitesStore.editSite(editing.value.id, payload)
  } else {
    await sitesStore.addSite(payload)
  }
  showForm.value = false
}
</script>

<template>
  <div class="view-toolbar d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-0">Sites</h1>
    <button class="btn btn-primary btn-sm" @click="onCreate">+ Nouveau site</button>
  </div>

  <SiteForm v-if="showForm" :initial="editing ?? undefined" class="mb-3" @submit="onSubmit" @cancel="showForm = false" />

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
