import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

import AppComponent from '@/App.vue'
import router from '@/core/router'
import { getValidAccessToken, logoutUser } from '@/core/auth'
import '@/core/charts'

import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/delivrone-custom.css'
import 'bootstrap'

const endpoint = import.meta.env.VITE_API_ENDPOINT || ''
axios.defaults.baseURL = endpoint

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const isAuthEndpoint = (url?: string): boolean => !!url?.startsWith('/auth/jwt/')

axios.interceptors.request.use(async (config) => {
  if (!isAuthEndpoint(config.url)) {
    const token = await getValidAccessToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined
    const status = error.response?.status as number | undefined
    const isUnauthorized = status === 401 || status === 403

    if (!originalRequest || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (isUnauthorized && !originalRequest._retry) {
      originalRequest._retry = true
      const token = await getValidAccessToken(true)
      if (!token) {
        logoutUser()
        router.push({ name: 'login' })
        return Promise.reject(error)
      }
      originalRequest.headers = new axios.AxiosHeaders({
        ...originalRequest.headers,
        Authorization: `Bearer ${token}`,
      })
      return axios(originalRequest)
    }
    return Promise.reject(error)
  }
)

createApp(AppComponent).use(router).use(createPinia()).mount('#app')
