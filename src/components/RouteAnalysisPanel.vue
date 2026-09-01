<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ loading: boolean }>()
const emit = defineEmits<{ run: [startDate: string, endDate: string] }>()

// Open-Meteo's archive has a data-availability lag, so the latest usable
// end date is a few days behind today — default to 10 days back, and cap
// the date picker there too. Default analysis window: 2 years.
const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const maxEndDate = new Date()
maxEndDate.setDate(maxEndDate.getDate() - 10)

const defaultStartDate = new Date(maxEndDate)
defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 2)

const maxEndDateIso = toIsoDate(maxEndDate)
const startDate = ref(toIsoDate(defaultStartDate))
const endDate = ref(maxEndDateIso)

const onRun = () => emit('run', startDate.value, endDate.value)
</script>

<template>
  <div class="card p-3 mb-3">
    <div class="row g-2 align-items-end">
      <div class="col-md-3">
        <label class="form-label">Du</label>
        <input v-model="startDate" type="date" class="form-control" />
      </div>
      <div class="col-md-3">
        <label class="form-label">Au</label>
        <input v-model="endDate" type="date" class="form-control" :max="maxEndDateIso" />
      </div>
      <div class="col-md-3">
        <button class="btn btn-primary" :disabled="props.loading" @click="onRun">
          {{ props.loading ? 'Analyse en cours...' : "Lancer l'analyse" }}
        </button>
      </div>
    </div>
  </div>
</template>
