<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Site } from '@/core/types'

const props = defineProps<{ initial?: Partial<Site> }>()
const emit = defineEmits<{ submit: [payload: Partial<Site>]; cancel: [] }>()

const blank: Partial<Site> = { name: '', latitude: '', longitude: '', is_active: true }
const form = reactive<Partial<Site>>({ ...blank, ...props.initial })

watch(
  () => props.initial,
  (value) => Object.assign(form, blank, value ?? {})
)

const onSubmit = () => emit('submit', { ...form })
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
    <button class="btn btn-link mt-1 p-0" type="button" @click="emit('cancel')">Annuler</button>
  </form>
</template>
