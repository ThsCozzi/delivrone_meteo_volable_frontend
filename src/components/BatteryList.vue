<script setup lang="ts">
import { reactive } from 'vue'
import type { Drone } from '@/core/types'
import { useBatteries } from '@/core/composables/useBatteries'

const props = defineProps<{ drone: Drone }>()
const emit = defineEmits<{ changed: [] }>()

const { createBattery, updateBattery, deleteBattery } = useBatteries()

const newBattery = reactive({ name: '', capacity_ah: '' })

const onAdd = async () => {
  if (!newBattery.name || !newBattery.capacity_ah) return
  await createBattery({
    drone: props.drone.id,
    name: newBattery.name,
    capacity_ah: newBattery.capacity_ah,
    is_default: props.drone.batteries.length === 0,
  })
  newBattery.name = ''
  newBattery.capacity_ah = ''
  emit('changed')
}

const onSetDefault = async (batteryId: number) => {
  await Promise.all(
    props.drone.batteries.map((b) => updateBattery(b.id, { is_default: b.id === batteryId }))
  )
  emit('changed')
}

const onDelete = async (batteryId: number) => {
  await deleteBattery(batteryId)
  emit('changed')
}
</script>

<template>
  <div>
    <ul class="list-group list-group-flush mb-2">
      <li
        v-for="battery in drone.batteries"
        :key="battery.id"
        class="list-group-item d-flex justify-content-between align-items-center px-0"
      >
        <span>
          {{ battery.name }}
          <span v-if="battery.is_default" class="badge bg-primary ms-1">défaut</span>
        </span>
        <span>
          <button
            v-if="!battery.is_default"
            class="btn btn-sm btn-link p-0 me-2"
            @click="onSetDefault(battery.id)"
          >
            Définir par défaut
          </button>
          <button class="btn btn-sm btn-link text-danger p-0" @click="onDelete(battery.id)">Supprimer</button>
        </span>
      </li>
      <li v-if="!drone.batteries.length" class="list-group-item px-0 text-muted small">
        Aucune batterie configurée.
      </li>
    </ul>

    <form class="d-flex gap-2" @submit.prevent="onAdd">
      <input v-model="newBattery.name" class="form-control form-control-sm" placeholder="Nom (ex: 22000 mAh)" required />
      <input
        v-model="newBattery.capacity_ah"
        class="form-control form-control-sm"
        placeholder="Capacité (Ah)"
        required
      />
      <button class="btn btn-sm btn-outline-success text-nowrap" type="submit">+ Ajouter</button>
    </form>
  </div>
</template>
