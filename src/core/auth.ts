import axios from 'axios'

let refreshPromise: Promise<string | null> | null = null

interface JwtPayload {
  exp: number
  [key: string]: unknown
}

interface TokenResponse {
  access?: string
  refresh?: string
}

export const decodeJwt = (token: string): JwtPayload => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

export const setTokens = (data: TokenResponse): void => {
  if (data.access) {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('access_token_exp', String(decodeJwt(data.access).exp))
  } else {
    localStorage.removeItem('access_token')
    localStorage.removeItem('access_token_exp')
  }
  if (data.refresh) {
    localStorage.setItem('refresh_token', data.refresh)
  } else {
    localStorage.removeItem('refresh_token')
  }
}

export const isAuthenticated = (): boolean => !!localStorage.getItem('access_token')

export const getValidAccessToken = async (forceRefresh = false): Promise<string | null> => {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const accessTokenExp = localStorage.getItem('access_token_exp')
    ? parseInt(localStorage.getItem('access_token_exp') as string, 10)
    : 0

  if (!accessToken || !refreshToken) return null
  const now = Date.now() / 1000

  if (!forceRefresh && accessTokenExp - now > 60) {
    return accessToken
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post('/auth/jwt/refresh', { refresh: refreshToken })
      .then((response) => {
        setTokens(response.data)
        return response.data.access as string
      })
      .catch(() => {
        logoutUser()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const login = async (username: string, password: string): Promise<void> => {
  const response = await axios.post('/auth/jwt/create', { username, password })
  setTokens(response.data)
}

export const logoutUser = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('access_token_exp')
}
