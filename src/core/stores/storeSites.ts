import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSites } from '@/core/composables/useSites'
import type { Site } from '@/core/types'

export const useSitesStore = defineStore('sites', () => {
  const { listSites, createSite, updateSite, deleteSite } = useSites()

  const sites = ref<Site[]>([])
  const status = ref<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const errorMessage = ref<string | null>(null)

  const fetchSites = async (): Promise<void> => {
    status.value = 'LOADING'
    try {
      sites.value = await listSites()
      status.value = 'SUCCESS'
    } catch (error) {
      status.value = 'ERROR'
      errorMessage.value = (error as Error).message
    }
  }

  const addSite = async (payload: Partial<Site>): Promise<Site> => {
    const created = await createSite(payload)
    sites.value.push(created)
    return created
  }

  const editSite = async (id: number, payload: Partial<Site>): Promise<void> => {
    const updated = await updateSite(id, payload)
    const index = sites.value.findIndex((s) => s.id === id)
    if (index !== -1) sites.value[index] = updated
  }

  const removeSite = async (id: number): Promise<void> => {
    await deleteSite(id)
    sites.value = sites.value.filter((s) => s.id !== id)
  }

  return { sites, status, errorMessage, fetchSites, addSite, editSite, removeSite }
})
