<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Drone } from '@/core/types'

const props = defineProps<{ initial?: Partial<Drone> }>()
const emit = defineEmits<{ submit: [payload: Partial<Drone>]; cancel: [] }>()

const blank: Partial<Drone> = {
  name: '',
  is_default: false,
  empty_weight_kg: '14.390',
  battery_weight_kg: '3.000',
  mtom_kg: '22.000',
  max_payload_kg: '3.000',
  battery_nominal_voltage_v: '44.40',
  battery_max_voltage_v: '50.40',
  land_min_soc_pct: '30',
  emergency_reserve_distance_km: '1.0',
  cruise_current_a: '17.46',
  mc_current_a: '90.00',
  mc_speed_ms: '5.00',
  takeoff_duration_min: '1.00',
  transition_duration_min: '0.50',
  landing_duration_min: '1.00',
  cruise_airspeed_ms: '29.44',
  wind_limit_ms: '12.00',
  rain_limit_mmh: '5.00',
  temp_min_c: '-7.00',
  temp_max_c: '40.00',
  icing_flight_prohibited: true,
  icing_temp_threshold_c: '3.00',
  icing_dewpoint_spread_c: '3.00',
}

const form = reactive<Partial<Drone>>({ ...blank, ...props.initial })

watch(
  () => props.initial,
  (value) => Object.assign(form, blank, value ?? {})
)

const onSubmit = () => emit('submit', { ...form })
</script>

<template>
  <form class="card p-3" @submit.prevent="onSubmit">
    <div class="row g-2">
      <div class="col-md-6">
        <label class="form-label">Nom</label>
        <input v-model="form.name" class="form-control" required />
      </div>
      <div class="col-md-6 d-flex align-items-end">
        <div class="form-check">
          <input id="is_default" v-model="form.is_default" type="checkbox" class="form-check-input" />
          <label class="form-check-label" for="is_default">Drone par défaut</label>
        </div>
      </div>

      <div class="col-12"><hr class="my-2" /><strong>Vent / pluie / température (go/no-go)</strong></div>
      <div class="col-md-3">
        <label class="form-label">Vent max (m/s)</label>
        <input v-model="form.wind_limit_ms" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Pluie max (mm/h)</label>
        <input v-model="form.rain_limit_mmh" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Temp. min (°C)</label>
        <input v-model="form.temp_min_c" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Temp. max (°C)</label>
        <input v-model="form.temp_max_c" class="form-control" required />
      </div>

      <div class="col-12"><hr class="my-2" /><strong>Vitesse / batterie</strong></div>
      <div class="col-md-3">
        <label class="form-label">Vitesse croisière (m/s)</label>
        <input v-model="form.cruise_airspeed_ms" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">SoC min à l'atterrissage (%)</label>
        <input v-model="form.land_min_soc_pct" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Réserve d'urgence (km, retour rallypoint en MC)</label>
        <input v-model="form.emergency_reserve_distance_km" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Courant croisière (A)</label>
        <input v-model="form.cruise_current_a" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Courant multicoptère (A)</label>
        <input v-model="form.mc_current_a" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Vitesse multicoptère (m/s)</label>
        <input v-model="form.mc_speed_ms" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Décollage (min)</label>
        <input v-model="form.takeoff_duration_min" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Transition (min)</label>
        <input v-model="form.transition_duration_min" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Atterrissage (min)</label>
        <input v-model="form.landing_duration_min" class="form-control" required />
      </div>

      <div class="col-12"><hr class="my-2" /><strong>Givrage</strong></div>
      <div class="col-md-4 d-flex align-items-end">
        <div class="form-check">
          <input
            id="icing_flight_prohibited"
            v-model="form.icing_flight_prohibited"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="icing_flight_prohibited">Vol en conditions givrantes interdit</label>
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Seuil temp. givrage (°C)</label>
        <input v-model="form.icing_temp_threshold_c" class="form-control" required />
      </div>
      <div class="col-md-4">
        <label class="form-label">Écart point de rosée max (°C)</label>
        <input v-model="form.icing_dewpoint_spread_c" class="form-control" required />
      </div>

      <div class="col-12"><hr class="my-2" /><strong>Masse</strong></div>
      <div class="col-md-3">
        <label class="form-label">Poids à vide (kg)</label>
        <input v-model="form.empty_weight_kg" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Poids batterie (kg)</label>
        <input v-model="form.battery_weight_kg" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">MTOM (kg)</label>
        <input v-model="form.mtom_kg" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Charge utile max (kg)</label>
        <input v-model="form.max_payload_kg" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Tension nominale (V)</label>
        <input v-model="form.battery_nominal_voltage_v" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Tension max (V)</label>
        <input v-model="form.battery_max_voltage_v" class="form-control" required />
      </div>
    </div>

    <div class="mt-3">
      <button class="btn btn-success" type="submit">Enregistrer</button>
      <button class="btn btn-link" type="button" @click="emit('cancel')">Annuler</button>
    </div>
  </form>
</template>
