<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{ latitude: string | number; longitude: string | number }>()
const emit = defineEmits<{ moved: [lat: number, lon: number] }>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

const markerIcon = L.divIcon({
  html: '<div class="site-marker-pin"></div>',
  className: 'site-marker-icon',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const toNumber = (value: string | number): number | null => {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : null
}

// A 1km x 1km box around the point — 1 degree of latitude is ~111.32km
// everywhere; 1 degree of longitude shrinks with cos(latitude).
const boundsAroundPoint = (lat: number, lon: number): L.LatLngBoundsExpression => {
  const halfLatDeg = 0.5 / 111.32
  const halfLonDeg = 0.5 / (111.32 * Math.cos((lat * Math.PI) / 180) || 1)
  return [
    [lat - halfLatDeg, lon - halfLonDeg],
    [lat + halfLatDeg, lon + halfLonDeg],
  ]
}

// Skip the next render triggered by the latitude/longitude props: after a
// drag we already emit the new position back up, which flows back down as
// updated props — re-applying it here would just re-fit the same bounds
// (harmless but pointless) and fights with the marker's own drag position.
let skipNextRender = false

const render = () => {
  if (skipNextRender) {
    skipNextRender = false
    return
  }

  const lat = toNumber(props.latitude)
  const lon = toNumber(props.longitude)
  if (lat === null || lon === null || !mapContainer.value) return

  if (!map) {
    map = L.map(mapContainer.value, { attributionControl: false })
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri' }
    ).addTo(map)
    // Transparent overlay with place/street/hospital labels on top of the
    // satellite imagery — Esri's standard "hybrid" pairing for World_Imagery.
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri' }
    ).addTo(map)

    marker = L.marker([lat, lon], { icon: markerIcon, draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const position = marker!.getLatLng()
      skipNextRender = true
      emit('moved', position.lat, position.lng)
    })
  } else {
    marker?.setLatLng([lat, lon])
  }

  map.fitBounds(boundsAroundPoint(lat, lon))
}

onMounted(render)
watch(() => [props.latitude, props.longitude], render)

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapContainer" class="site-map" />
  <p class="text-muted small mb-0 mt-1">Glissez le point rouge pour ajuster la position.</p>
</template>

<style scoped>
.site-map {
  height: 260px;
  border-radius: var(--delivrone-border-radius, 0.25rem);
}
</style>

<style>
.site-marker-icon {
  background: transparent;
  border: none;
}
.site-marker-pin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc3545;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
  cursor: grab;
}
</style>
