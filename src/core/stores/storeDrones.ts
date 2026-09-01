import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDrones } from '@/core/composables/useDrones'
import type { Drone } from '@/core/types'

export const useDronesStore = defineStore('drones', () => {
  const { listDrones, createDrone, updateDrone, deleteDrone } = useDrones()

  const drones = ref<Drone[]>([])
  const status = ref<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const errorMessage = ref<string | null>(null)

  const fetchDrones = async (): Promise<void> => {
    status.value = 'LOADING'
    try {
      drones.value = await listDrones()
      status.value = 'SUCCESS'
    } catch (error) {
      status.value = 'ERROR'
      errorMessage.value = (error as Error).message
    }
  }

  const addDrone = async (payload: Partial<Drone>): Promise<Drone> => {
    const created = await createDrone(payload)
    drones.value.push(created)
    return created
  }

  const editDrone = async (id: number, payload: Partial<Drone>): Promise<void> => {
    const updated = await updateDrone(id, payload)
    const index = drones.value.findIndex((d) => d.id === id)
    if (index !== -1) drones.value[index] = updated
  }

  const removeDrone = async (id: number): Promise<void> => {
    await deleteDrone(id)
    drones.value = drones.value.filter((d) => d.id !== id)
  }

  return { drones, status, errorMessage, fetchDrones, addDrone, editDrone, removeDrone }
})
