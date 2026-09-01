<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAuthenticated, logoutUser } from '@/core/auth'

const route = useRoute()
const router = useRouter()

const authenticated = computed(() => isAuthenticated())

const onLogout = () => {
  logoutUser()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav v-if="authenticated && route.name !== 'login'" class="navbar navbar-expand fixed-top navbar-delivrone px-3">
    <span class="navbar-brand">Delivrone - Météo Volable</span>
    <div class="navbar-nav">
      <RouterLink class="nav-link" :to="{ name: 'routes' }">Lignes</RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'drones' }">Drones</RouterLink>
      <RouterLink class="nav-link" :to="{ name: 'sites' }">Sites</RouterLink>
    </div>
    <button class="btn btn-outline-light btn-sm ms-auto" @click="onLogout">Déconnexion</button>
  </nav>

  <main :class="authenticated && route.name !== 'login' ? 'view-layout container-fluid' : ''">
    <RouterView />
  </main>
</template>
