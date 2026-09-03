export interface DroneEnduranceEntry {
  id: number
  payload_kg: string
  endurance_minutes: string
  range_km: string
}

export interface Battery {
  id: number
  drone: number
  name: string
  capacity_ah: string
  is_default: boolean
}

export interface Drone {
  id: number
  name: string
  is_default: boolean
  empty_weight_kg: string
  battery_weight_kg: string
  mtom_kg: string
  max_payload_kg: string
  battery_nominal_voltage_v: string
  battery_max_voltage_v: string
  land_min_soc_pct: string
  emergency_reserve_distance_km: string
  cruise_current_a: string
  mc_current_a: string
  mc_speed_ms: string
  takeoff_duration_min: string
  transition_duration_min: string
  landing_duration_min: string
  cruise_airspeed_ms: string
  stall_speed_ms_min: string | null
  stall_speed_ms_max: string | null
  wind_limit_ms: string
  wind_limit_mc_transition_ms: string | null
  rain_limit_mmh: string
  temp_min_c: string
  temp_max_c: string
  icing_flight_prohibited: boolean
  icing_temp_threshold_c: string
  icing_dewpoint_spread_c: string
  max_altitude_m_amsl: string | null
  endurance_entries: DroneEnduranceEntry[]
  batteries: Battery[]
  created_at: string
  updated_at: string
}

export interface Site {
  id: number
  name: string
  latitude: string
  longitude: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LatestFlyabilityResult {
  id: number
  overall_pct_flyable: string
  start_date: string
  end_date: string
  computed_at: string
  total_hours: number
  drone: number | null
  drone_name: string | null
  battery: number | null
  battery_name: string | null
}

export interface Route {
  id: number
  name: string
  origin: number
  destination: number
  origin_detail: Site
  destination_detail: Site
  drone: number | null
  is_active: boolean
  mc_distance_km_origin: string
  mc_distance_km_destination: string
  fw_distance_km: string | null
  resolved_fw_distance_km: string
  distance_km_outbound: string
  distance_km_return: string
  bearing_deg_outbound: string
  bearing_deg_return: string
  latest_result: LatestFlyabilityResult | null
  resolved_drone: Drone | null
  created_at: string
  updated_at: string
}

export interface TimeslotBreakdown {
  total_hours: number
  flyable_hours: number
  pct_flyable: number
  causes: Record<string, number>
}

export interface FlyabilityResult {
  id: number
  route: number
  drone: number | null
  drone_name: string | null
  battery: number | null
  battery_name: string | null
  start_date: string
  end_date: string
  computed_at: string
  overall_pct_flyable: string
  total_hours: number
  flyable_hours: number
  cause_battery_hours: number
  cause_rain_hours: number
  cause_temp_min_hours: number
  cause_temp_max_hours: number
  cause_wind_hours: number
  cause_icing_hours: number
  timeslot_breakdown: Record<string, TimeslotBreakdown>
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
