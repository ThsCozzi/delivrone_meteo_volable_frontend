<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { FlyabilityResult } from '@/core/types'

const props = defineProps<{ result: FlyabilityResult }>()

const chartData = computed(() => ({
  labels: ['Vent', 'Pluie', 'Temp. min', 'Temp. max', 'Givrage', 'Batterie'],
  datasets: [
    {
      label: 'Heures non volables par cause',
      backgroundColor: '#1e5782',
      data: [
        props.result.cause_wind_hours,
        props.result.cause_rain_hours,
        props.result.cause_temp_min_hours,
        props.result.cause_temp_max_hours,
        props.result.cause_icing_hours,
        props.result.cause_battery_hours,
      ],
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } },
}
</script>

<template>
  <div>
    <h2 class="h6">Causes de non-volabilité</h2>
    <p class="small text-muted">
      Un même créneau peut cumuler plusieurs causes (non exclusives) — la somme peut dépasser le nombre
      d'heures non volables.
    </p>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
