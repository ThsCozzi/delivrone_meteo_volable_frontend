<script setup lang="ts">
import { computed } from 'vue'
import type { FlyabilityResult } from '@/core/types'
import FlyabilityCauseChart from '@/components/FlyabilityCauseChart.vue'
import FlyabilityTimeslotChart from '@/components/FlyabilityTimeslotChart.vue'
import FlyabilityPieChart from '@/components/FlyabilityPieChart.vue'

const props = defineProps<{ result: FlyabilityResult }>()

const pctClass = computed(() => {
  const pct = Number(props.result.overall_pct_flyable)
  if (pct >= 70) return 'pct-flyable-high'
  if (pct >= 40) return 'pct-flyable-medium'
  return 'pct-flyable-low'
})
</script>

<template>
  <div class="card-flyability card p-3 mb-3">
    <div class="row text-center mb-4">
      <div class="col-md-3">
        <div class="display-6" :class="pctClass">{{ Number(result.overall_pct_flyable).toFixed(1) }}%</div>
        <div class="text-muted small">Volable sur la période</div>
      </div>
      <div class="col-md-3">
        <div class="display-6">{{ result.flyable_hours }}</div>
        <div class="text-muted small">Heures volables</div>
      </div>
      <div class="col-md-3">
        <div class="display-6">{{ result.total_hours - result.flyable_hours }}</div>
        <div class="text-muted small">Heures non volables</div>
      </div>
      <div class="col-md-3">
        <div class="display-6">{{ result.total_hours }}</div>
        <div class="text-muted small">Heures analysées</div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4">
        <FlyabilityPieChart :result="result" />
      </div>
      <div class="col-md-4">
        <FlyabilityCauseChart :result="result" />
      </div>
      <div class="col-md-4">
        <FlyabilityTimeslotChart :result="result" />
      </div>
    </div>

    <p class="text-muted small mt-3 mb-0">
      Calculé le {{ new Date(result.computed_at).toLocaleString('fr-FR') }} pour la période
      {{ result.start_date }} → {{ result.end_date }}
      <template v-if="result.drone_name">— drone {{ result.drone_name }}</template>
      <template v-if="result.battery_name">, batterie {{ result.battery_name }}</template>.
    </p>
  </div>
</template>
