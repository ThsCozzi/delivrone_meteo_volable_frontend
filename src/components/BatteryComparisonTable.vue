<script setup lang="ts">
import type { FlyabilityResult } from '@/core/types'

const props = defineProps<{ results: FlyabilityResult[]; selectedId: number | null }>()
const emit = defineEmits<{ select: [result: FlyabilityResult] }>()
</script>

<template>
  <div class="card p-3 mb-3">
    <h2 class="h6">Comparaison des batteries</h2>
    <p class="text-muted small">Cliquez sur une ligne pour voir le détail de l'analyse correspondante ci-dessous.</p>
    <table class="table table-hover table-sm mb-0">
      <thead>
        <tr>
          <th>Batterie</th>
          <th>% volable</th>
          <th>Heures volables</th>
          <th>Heures analysées</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="result in props.results"
          :key="result.id"
          role="button"
          :class="{ 'table-primary': result.id === props.selectedId }"
          @click="emit('select', result)"
        >
          <td>{{ result.battery_name }}</td>
          <td class="fw-bold">{{ Number(result.overall_pct_flyable).toFixed(1) }}%</td>
          <td>{{ result.flyable_hours }}</td>
          <td>{{ result.total_hours }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
