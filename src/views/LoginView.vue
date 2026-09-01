<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/core/auth'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    await login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    error.value = 'Identifiants invalides.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <form class="card p-4 shadow-sm" style="min-width: 320px" @submit.prevent="onSubmit">
      <h1 class="h5 mb-3">Delivrone - Météo Volable</h1>
      <div class="mb-3">
        <label class="form-label" for="username">Identifiant</label>
        <input id="username" v-model="username" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label" for="password">Mot de passe</label>
        <input id="password" v-model="password" type="password" class="form-control" required />
      </div>
      <p v-if="error" class="text-danger small">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>
