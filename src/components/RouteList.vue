<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Trash2 } from 'lucide-vue-next'
import type { Route } from '@/core/types'

defineProps<{ routes: Route[] }>()
const emit = defineEmits<{ delete: [routeId: number] }>()

const router = useRouter()

const goToDetail = (routeId: number) => {
  router.push({ name: 'route-detail', params: { id: routeId } })
}

const onDelete = (route: Route) => {
  if (confirm(`Supprimer la ligne "${route.name}" ? L'historique des analyses sera perdu.`)) {
    emit('delete', route.id)
  }
}

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

const latestComputedAt = (route: Route): string =>
  route.latest_results_by_battery.reduce(
    (latest, r) => (r.computed_at > latest ? r.computed_at : latest),
    route.latest_results_by_battery[0]?.computed_at ?? ''
  )
</script>

<template>
  <table class="table table-hover bg-white">
    <thead>
      <tr>
        <th>Ligne</th>
        <th>Origine</th>
        <th>Destination</th>
        <th>Distance (km)</th>
        <th>Drone</th>
        <th>% volable par batterie</th>
        <th>Dernière analyse</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="route in routes"
        :key="route.id"
        role="button"
        style="cursor: pointer"
        @click="goToDetail(route.id)"
      >
        <td>{{ route.name }}</td>
        <td>{{ route.origin_detail?.name }}</td>
        <td>{{ route.destination_detail?.name }}</td>
        <td>{{ Number(route.distance_km_outbound).toFixed(1) }}</td>

        <template v-if="route.latest_results_by_battery.length">
          <td class="small">{{ route.latest_results_by_battery[0]?.drone_name ?? '—' }}</td>
          <td>
            <div v-for="r in route.latest_results_by_battery" :key="r.id" class="small mb-1">
              <span class="text-muted">{{ r.battery_name ?? '—' }} :</span>
              <span class="fw-semibold" :class="pctClass(Number(r.overall_pct_flyable))">
                {{ Number(r.overall_pct_flyable).toFixed(1) }}%
              </span>
              <span class="text-muted">
                ({{ daysBetween(r.start_date, r.end_date) }} j, {{ r.start_date }} → {{ r.end_date }})
              </span>
            </div>
          </td>
          <td class="text-muted small">{{ formatDate(latestComputedAt(route)) }}</td>
        </template>
        <template v-else>
          <td colspan="3">
            <span class="badge bg-secondary-subtle text-secondary-emphasis">Pas encore analysée</span>
          </td>
        </template>

        <td class="text-end">
          <button
            class="btn btn-sm btn-outline-danger"
            title="Supprimer la ligne"
            @click.stop="onDelete(route)"
          >
            <Trash2 :size="16" />
          </button>
        </td>
      </tr>
      <tr v-if="!routes.length">
        <td colspan="8" class="text-center text-muted py-4">Aucune ligne pour le moment.</td>
      </tr>
    </tbody>
  </table>
</template>
