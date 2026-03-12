/**
 * User store - mirrors Redux user.reducer
 * Manages user data, subscription details, subscription modal
 */
import { defineStore } from 'pinia'
import { fetchSubscriptionDetails } from '../services/subscription/subscriptionCheck'
import { setUser, clearUser } from '../services/config/api'

export interface UserData {
  name?: string
  name_eng?: string
  mobile?: string
  role?: string
  id?: unknown
  email?: string
  [key: string]: unknown
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserData | null,
    isAuthenticated: false,
    subscriptionDetails: null as {
      showSubscriptionModel: boolean
      hasActiveSubscription: boolean
      hasTransporter499: boolean
      [key: string]: unknown
    } | null,
    subscriptionModal: false,
    subscriptionModalOptions: {
      upgradeOnly: false,
      minPrice: 0 as number | undefined,
    },
  }),
  getters: {
    isTransporter: (state) =>
      (state.user?.role || '').toLowerCase() === 'transporter',
    isDriver: (state) =>
      ['driver', 'foreman', 'association'].includes(
        (state.user?.role || '').toLowerCase()
      ),
    showSubscriptionModel: (state) =>
      state.subscriptionDetails?.showSubscriptionModel ?? false,
    hasPremium: (state) =>
      state.subscriptionDetails?.hasActiveSubscription ?? false,
    hasTransporter499Plan: (state) =>
      state.subscriptionDetails?.hasTransporter499 ?? false,
  },
  actions: {
    setUserAuthenticated(payload: boolean) {
      this.isAuthenticated = Boolean(payload)
    },
    setUser(payload: UserData | null) {
      this.user = payload
      this.isAuthenticated = !!payload
      if (payload) {
        setUser(payload)
      } else {
        clearUser()
      }
    },
    setSubscriptionDetails(payload: {
      showSubscriptionModel?: boolean
      hasActiveSubscription?: boolean
      [key: string]: unknown
    } | null) {
      this.subscriptionDetails = payload
    },
    setSubscriptionModal(payload: boolean | { visible?: boolean; upgradeOnly?: boolean; minPrice?: number }) {
      if (typeof payload === 'object' && payload !== null) {
        this.subscriptionModal = payload.visible ?? false
        this.subscriptionModalOptions = {
          upgradeOnly: payload.upgradeOnly ?? false,
          minPrice: payload.minPrice,
        }
      } else {
        this.subscriptionModal = Boolean(payload)
        this.subscriptionModalOptions = { upgradeOnly: false, minPrice: 0 }
      }
    },
    async fetchSubscription() {
      try {
        const res = await fetchSubscriptionDetails()
        this.subscriptionDetails = {
          showSubscriptionModel: res.showSubscriptionModel,
          hasActiveSubscription: res.hasPremium,
          hasTransporter499: res.hasTransporter499,
        }
        return res
      } catch {
        this.subscriptionDetails = {
          showSubscriptionModel: false,
          hasActiveSubscription: false,
          hasTransporter499: false,
        }
        return null
      }
    },
    reset() {
      this.user = null
      this.isAuthenticated = false
      this.subscriptionDetails = null
      this.subscriptionModal = false
      this.subscriptionModalOptions = { upgradeOnly: false, minPrice: 0 }
      clearUser()
    },
  },
})
