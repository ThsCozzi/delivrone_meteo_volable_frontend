<script setup lang="ts">
import type { Route } from '@/core/types'

defineProps<{ routes: Route[] }>()

const daysBetween = (start: string, end: string): number =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000)

const pctClass = (pct: number): string => {
  if (pct >= 70) return 'pct-flyable-high'
  if (pct >= 40) return 'pct-flyable-medium'
  return 'pct-flyable-low'
}

const formatDate = (isoDateTime: string): string =>
  new Date(isoDateTime).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<template>
  <table class="table table-hover bg-white">
    <thead>
      <tr>
        <th>Ligne</th>
        <th>Origine</th>
        <th>Destination</th>
        <th>Distance (km)</th>
        <th>% volable</th>
        <th>Période analysée</th>
        <th>Dernière analyse</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="route in routes" :key="route.id">
        <td>{{ route.name }}</td>
        <td>{{ route.origin_detail?.name }}</td>
        <td>{{ route.destination_detail?.name }}</td>
        <td>{{ Number(route.distance_km_outbound).toFixed(1) }}</td>

        <template v-if="route.latest_result">
          <td class="fw-semibold" :class="pctClass(Number(route.latest_result.overall_pct_flyable))">
            {{ Number(route.latest_result.overall_pct_flyable).toFixed(1) }}%
          </td>
          <td>
            {{ daysBetween(route.latest_result.start_date, route.latest_result.end_date) }} j
            <span class="text-muted small d-block">
              {{ route.latest_result.start_date }} → {{ route.latest_result.end_date }}
            </span>
          </td>
          <td class="text-muted small">{{ formatDate(route.latest_result.computed_at) }}</td>
        </template>
        <template v-else>
          <td colspan="3">
            <span class="badge bg-secondary-subtle text-secondary-emphasis">Pas encore analysée</span>
          </td>
        </template>

        <td>
          <RouterLink class="btn btn-sm btn-outline-primary" :to="{ name: 'route-detail', params: { id: route.id } }">
            Analyser
          </RouterLink>
        </td>
      </tr>
      <tr v-if="!routes.length">
        <td colspan="8" class="text-center text-muted py-4">Aucune ligne pour le moment.</td>
      </tr>
    </tbody>
  </table>
</template>
