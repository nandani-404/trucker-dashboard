/**
 * Auth store - mirrors Redux auth.reducer
 * Manages authentication state: token, isAuthenticated, tokenValidated
 */
import { defineStore } from 'pinia'
import { getAuthToken, setAuthToken, clearAuthToken } from '../services/config/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    token: null as string | null,
    tokenValidated: false,
  }),
  getters: {
    hasToken: (state) => !!state.token,
  },
  actions: {
    setAuthenticated(payload: boolean) {
      this.isAuthenticated = Boolean(payload)
    },
    setToken(payload: string | null) {
      this.token = payload
      if (payload) {
        setAuthToken(payload)
      } else {
        clearAuthToken()
      }
    },
    setTokenValidated(payload: boolean) {
      this.tokenValidated = payload
    },
    logout() {
      this.isAuthenticated = false
      this.token = null
      this.tokenValidated = false
      clearAuthToken()
    },
    hydrateFromStorage() {
      const token = getAuthToken()
      if (token) {
        this.token = token
        this.isAuthenticated = true
      }
    },
  },
})
