<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import type { FlyabilityResult } from '@/core/types'

const props = defineProps<{ result: FlyabilityResult }>()

const pctFlyable = computed(() => Number(props.result.overall_pct_flyable))

const chartData = computed(() => ({
  labels: ['Créneaux volables', 'Créneaux non volables'],
  datasets: [
    {
      data: [pctFlyable.value, 100 - pctFlyable.value],
      backgroundColor: ['#28a745', '#dc3545'],
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    tooltip: {
      callbacks: {
        label: (context: { label: string; parsed: number }) => `${context.label}: ${context.parsed.toFixed(1)}%`,
      },
    },
  },
}
</script>

<template>
  <div>
    <h2 class="h6">Créneaux volables</h2>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>
