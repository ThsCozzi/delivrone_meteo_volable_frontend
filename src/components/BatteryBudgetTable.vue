<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BatteryBudget, LegConsumptionBreakdown } from '@/core/types'

const props = defineProps<{ budgets: BatteryBudget[]; originName?: string; destinationName?: string }>()

const leg = ref<'outbound' | 'return'>('outbound')

const fmt = (ah: number) => ah.toFixed(3)

const rows: { key: keyof LegConsumptionBreakdown; label: string }[] = [
  { key: 'takeoff_ah', label: 'Décollage (MC)' },
  { key: 'mc_horizontal_ah', label: 'Trajet MC (2 côtés)' },
  { key: 'transition_ah', label: 'Transitions MC/FW (x2)' },
  { key: 'fw_cruise_ah', label: 'Croisière voilure fixe' },
  { key: 'landing_ah', label: 'Atterrissage (MC)' },
]

const legLabel = computed(() =>
  leg.value === 'outbound'
    ? `Aller (${props.originName ?? '?'} → ${props.destinationName ?? '?'})`
    : `Retour (${props.destinationName ?? '?'} → ${props.originName ?? '?'})`
)

const marginKey = computed<'outbound_margin_ah' | 'return_margin_ah'>(() =>
  leg.value === 'outbound' ? 'outbound_margin_ah' : 'return_margin_ah'
)
</script>

<template>
  <div class="card p-3 mb-3">
    <h2 class="h6">Détail du calcul batterie (vent nul — cas le plus favorable)</h2>
    <p class="text-muted small">
      Conditions idéales, sans vent : si une batterie échoue déjà ici, elle échoue à 100% des heures quelle que
      soit la météo réelle. Utile pour comparer ces valeurs à vos vols réels et repérer quelle hypothèse
      (courants, durées de phase, réserve d'urgence...) mérite d'être recalibrée.
    </p>

    <ul class="nav nav-tabs nav-fill mb-3 small">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: leg === 'outbound' }"
          type="button"
          @click="leg = 'outbound'"
        >
          Aller
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: leg === 'return' }" type="button" @click="leg = 'return'">
          Retour
        </button>
      </li>
    </ul>
    <p class="text-muted small mb-2">{{ legLabel }}</p>

    <div class="table-responsive">
      <table class="table table-sm mb-0">
        <thead>
          <tr>
            <th></th>
            <th v-for="b in props.budgets" :key="b.battery" class="text-end">{{ b.battery_name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td class="text-muted">{{ row.label }}</td>
            <td v-for="b in props.budgets" :key="b.battery" class="text-end">
              {{ fmt(b[leg][row.key]) }} Ah
            </td>
          </tr>
          <tr class="border-top">
            <td class="fw-semibold">Total consommé</td>
            <td v-for="b in props.budgets" :key="b.battery" class="text-end fw-semibold">
              {{ fmt(b[leg].total_ah) }} Ah
            </td>
          </tr>
          <tr>
            <td class="text-muted">Capacité utilisable</td>
            <td v-for="b in props.budgets" :key="b.battery" class="text-end text-muted">
              {{ fmt(b.usable_capacity_ah) }} Ah
              <span class="d-block" style="font-size: 0.75rem">
                ({{ fmt(b.capacity_ah) }} Ah − {{ fmt(b.land_floor_ah) }} sol − {{ fmt(b.emergency_reserve_ah) }} urgence)
              </span>
            </td>
          </tr>
          <tr class="border-top">
            <td class="fw-semibold">Marge</td>
            <td
              v-for="b in props.budgets"
              :key="b.battery"
              class="text-end fw-bold"
              :class="b[marginKey] >= 0 ? 'text-success' : 'text-danger'"
            >
              {{ b[marginKey] >= 0 ? '+' : '' }}{{ fmt(b[marginKey]) }} Ah
              <span class="d-block small fw-normal">{{ b[marginKey] >= 0 ? 'GO' : "NO-GO, même par vent nul" }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
