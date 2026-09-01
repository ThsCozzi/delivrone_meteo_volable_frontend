<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import type { FlyabilityResult } from '@/core/types'

const props = defineProps<{ result: FlyabilityResult }>()

const SLOT_ORDER = ['fin_de_nuit', 'matin', 'apres_midi', 'debut_de_nuit']
const SLOT_LABELS: Record<string, string> = {
  fin_de_nuit: 'Fin de nuit (0-6h)',
  matin: 'Matin (6-12h)',
  apres_midi: 'Après-midi (12-18h)',
  debut_de_nuit: 'Début de nuit (18-24h)',
}

const chartData = computed(() => ({
  labels: SLOT_ORDER.map((key) => SLOT_LABELS[key]),
  datasets: [
    {
      label: '% volable',
      backgroundColor: '#2b9fc8',
      data: SLOT_ORDER.map((key) => props.result.timeslot_breakdown[key]?.pct_flyable ?? 0),
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '% volable' } } },
}
</script>

<template>
  <div>
    <h2 class="h6">% volable par créneau</h2>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
