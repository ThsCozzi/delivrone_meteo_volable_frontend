<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoutesStore } from '@/core/stores/storeRoutes'
import { useSitesStore } from '@/core/stores/storeSites'
import RouteList from '@/components/RouteList.vue'

const routesStore = useRoutesStore()
const sitesStore = useSitesStore()

const showForm = ref(false)
const originId = ref<number | null>(null)
const destinationId = ref<number | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

onMounted(() => {
  routesStore.fetchRoutes()
  sitesStore.fetchSites()
})

const onCreate = async () => {
  if (!originId.value || !destinationId.value) return
  submitting.value = true
  error.value = null
  try {
    await routesStore.addRoute({ origin: originId.value, destination: destinationId.value })
    showForm.value = false
    originId.value = null
    destinationId.value = null
  } catch {
    error.value = "Impossible de créer la ligne."
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="view-toolbar d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4 mb-0">Lignes</h1>
    <button class="btn btn-primary btn-sm" @click="showForm = !showForm">
      {{ showForm ? 'Annuler' : '+ Nouvelle ligne' }}
    </button>
  </div>

  <form v-if="showForm" class="card p-3 mb-3" @submit.prevent="onCreate">
    <div class="row g-2 align-items-end">
      <div class="col-md-4">
        <label class="form-label">Origine</label>
        <select v-model="originId" class="form-select" required>
          <option :value="null" disabled>Choisir un site</option>
          <option v-for="site in sitesStore.sites" :key="site.id" :value="site.id">{{ site.name }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Destination</label>
        <select v-model="destinationId" class="form-select" required>
          <option :value="null" disabled>Choisir un site</option>
          <option v-for="site in sitesStore.sites" :key="site.id" :value="site.id">{{ site.name }}</option>
        </select>
      </div>
      <div class="col-md-4">
        <button class="btn btn-success" type="submit" :disabled="submitting">Créer</button>
      </div>
    </div>
    <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
  </form>

  <p v-if="routesStore.status === 'LOADING'" class="text-muted">Chargement...</p>
  <p v-else-if="routesStore.status === 'ERROR'" class="text-danger">{{ routesStore.errorMessage }}</p>
  <RouteList v-else :routes="routesStore.routes" />
</template>
